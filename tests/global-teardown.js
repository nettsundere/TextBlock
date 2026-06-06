module.exports = async () => {
  if (globalThis.__testServer) {
    await new Promise((resolve) => globalThis.__testServer.close(resolve));
  }
};
