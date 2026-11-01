import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { getConfig } from '../../config';
import Error400 from '../../errors/Error400';
import Roles from '../../security/roles';
import Plans from '../../security/plans';
import AuditLog from '../../database/models/auditLog';
import ChatConversation from '../../database/models/chatConversation';
import ChatMessage from '../../database/models/chatMessage';
import Deposit from '../../database/models/deposit';
import DetailsCampagne from '../../database/models/detailsCampagne';
import Dons from '../../database/models/dons';
import Futures from '../../database/models/futures';
import HistoriquePoints from '../../database/models/historiquePoints';
import Kyc from '../../database/models/kyc';
import Mandat from '../../database/models/mandat';
import Notification from '../../database/models/notification';
import ProduitCommande from '../../database/models/produitCommande';
import Records from '../../database/models/records';
import Spot from '../../database/models/spot';
import Stacking from '../../database/models/stacking';
import TradeOrder from '../../database/models/tradeOrder';
import Transaction from '../../database/models/transaction';
import Transfer from '../../database/models/Transfer';
import User from '../../database/models/user';
import UserMessage from '../../database/models/userMessage';
import Votes from '../../database/models/votes';
import Wallet from '../../database/models/wallet';
import Withdraw from '../../database/models/withdraw';
import { IServiceOptions } from '../IServiceOptions';

// Must match UPLOAD_DIR in services/file/localhostFileStorage.ts.
const UPLOAD_ROOT = path.resolve('/upload');

// Each collection with the field that names the record's owner. Admin-written fields such
// as `auditor` or a stray `updatedBy` are left out so staff records are never touched.
const OWNED_RECORDS: Array<[(database) => any, string]> = [
  [Deposit, 'createdBy'],
  [DetailsCampagne, 'adherent'],
  [Dons, 'adherent'],
  [Futures, 'createdBy'],
  [HistoriquePoints, 'adherent'],
  [Kyc, 'user'],
  [Notification, 'userId'],
  [ProduitCommande, 'adherent'],
  [Records, 'user'],
  [Spot, 'userAccount'],
  [Stacking, 'user'],
  [TradeOrder, 'user'],
  [Transaction, 'user'],
  [Transfer, 'user'],
  [UserMessage, 'createdBy'],
  [Votes, 'adherent'],
  [Wallet, 'user'],
  [Withdraw, 'createdBy'],
];

function collectPrivateUrls(value: any, found: Set<string>) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectPrivateUrls(item, found));
  } else if (value && typeof value === 'object' && !(value instanceof Date)) {
    if (typeof value.privateUrl === 'string') found.add(value.privateUrl);
    Object.values(value).forEach((item) => collectPrivateUrls(item, found));
  }
}

/**
 * Removes a client and everything they own. Unlike UserDestroyer (the "Freeze" button),
 * this can't be undone. Transactions are off on this database, so the user document goes
 * last: if a step fails the client is still listed and the delete can be run again.
 */
export default class UserPermanentDestroyer {
  options: IServiceOptions;

  constructor(options) {
    this.options = options;
  }

  async destroy(id) {
    const { database, currentTenant, currentUser, language } = this.options;
    const userId = String(id || '').trim();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error400(language, 'user.errors.userNotFound');
    }

    const user = await User(database).findById(userId).lean();
    const tenants = (user?.tenants || []) as any[];
    const inTenant = tenants.some((t) => String(t.tenant) === String(currentTenant.id));

    if (!user || !inTenant) {
      throw new Error400(language, 'user.errors.userNotFound');
    }
    if (userId === String(currentUser.id)) {
      throw new Error400(language, 'user.errors.destroyingHimself');
    }
    if (tenants.some((t) => (t.roles || []).includes(Roles.values.admin))) {
      throw new Error400(language, 'user.errors.destroyingAdmin');
    }
    if (currentTenant.plan !== Plans.values.free && String(currentTenant.planUserId) === userId) {
      throw new Error400(language, 'user.errors.destroyingPlanUser');
    }

    const files = new Set<string>();
    collectPrivateUrls(user.avatars, files);
    collectPrivateUrls(await Kyc(database).find({ user: userId }).lean(), files);
    collectPrivateUrls(await Deposit(database).find({ createdBy: userId }).lean(), files);

    for (const [model, field] of OWNED_RECORDS) {
      await model(database).deleteMany({ [field]: userId });
    }

    // auditLog.user is free text, so it can hold either the id or the email.
    await AuditLog(database).deleteMany({ user: { $in: [userId, user.email] } });

    const conversations = await ChatConversation(database).find({ customer: userId }, '_id').lean();
    await ChatMessage(database).deleteMany({
      $or: [{ sender: userId }, { conversation: { $in: conversations.map((c) => c._id) } }],
    });
    await ChatConversation(database).deleteMany({ customer: userId });
    await Mandat(database).updateMany({ members: userId }, { $pull: { members: userId } });

    await User(database).deleteOne({ _id: userId });

    await this._removeFiles(userId, tenants, files);

    console.log(`User ${userId} permanently deleted by admin ${currentUser.id}`);
  }

  // Runs after the records are gone: a leftover file must not fail the delete.
  async _removeFiles(userId: string, tenants: any[], files: Set<string>) {
    if (getConfig().FILE_STORAGE_PROVIDER !== 'localhost') return;

    const targets = [
      ...Array.from(files),
      `user/avatars/profile/${userId}`,
      `user/passport/copy/${userId}`,
      ...tenants.map((t) => `tenant/${t.tenant}/chat/${userId}`),
    ];

    for (const target of targets) {
      const fullPath = path.resolve(UPLOAD_ROOT, target);
      if (!fullPath.startsWith(UPLOAD_ROOT + path.sep)) continue;
      try {
        await fs.promises.rm(fullPath, { recursive: true, force: true });
      } catch (error) {
        console.error(`Could not remove ${target}:`, error);
      }
    }
  }
}
