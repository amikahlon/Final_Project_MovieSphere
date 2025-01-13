export const rootPaths = {
  root: '/',
  pageRoot: 'pages',
  authRoot: 'auth',
  errorRoot: 'error',
};

export default {
  dashboard: `/${rootPaths.pageRoot}/dashboard`,
  settings: `/${rootPaths.pageRoot}/settings`,

  signin: `/${rootPaths.authRoot}/signin`,
  signup: `/${rootPaths.authRoot}/signup`,
  404: `/${rootPaths.errorRoot}/404`,
};
