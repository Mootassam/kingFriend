// /clients and /user share the same pages and the same list state, so anything that
// redirects or refetches has to stay in the section the admin is working in.
export const isClientsPath = () =>
  window.location.pathname.startsWith('/clients');

export const userListPath = () =>
  isClientsPath() ? '/clients' : '/user';
