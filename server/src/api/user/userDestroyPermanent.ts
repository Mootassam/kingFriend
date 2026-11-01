import UserPermanentDestroyer from '../../services/user/userPermanentDestroyer';
import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';

export default async (req, res) => {
  try {
    new PermissionChecker(req).validateHas(
      Permissions.values.userDestroy,
    );

    await new UserPermanentDestroyer(req).destroy(req.params.id);

    await ApiResponseHandler.success(req, res, true);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
