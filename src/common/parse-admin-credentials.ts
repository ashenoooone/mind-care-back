export const parseAdminCredentials = (credentials: string) => {
  const split = credentials.split(':');
  return {
    login: split[0],
    password: split[1],
  } as const;
};
