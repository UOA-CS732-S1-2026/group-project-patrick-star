declare module "auth0-js" {
  type Auth0Constructor = new (...args: unknown[]) => unknown;

  const auth0: {
    WebAuth: Auth0Constructor;
    Authentication: Auth0Constructor;
  };
  export default auth0;
}
