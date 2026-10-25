type Listener = (message?: string) => void;

const listeners: Listener[] = [];
let pending: { message?: string } | null = null;

// Lets any page open the live chat widget mounted in LayoutPage, optionally with a
// message prefilled in the composer. An open request made before the widget mounts
// is kept until it does.
const chatWidgetBus = {
  open(message?: string) {
    if (listeners.length === 0) {
      pending = { message };
      return;
    }
    listeners.forEach((listener) => listener(message));
  },
  onOpen(listener: Listener) {
    listeners.push(listener);
    if (pending) {
      const { message } = pending;
      pending = null;
      listener(message);
    }
    return () => {
      const index = listeners.indexOf(listener);
      if (index !== -1) listeners.splice(index, 1);
    };
  },
};

export default chatWidgetBus;
