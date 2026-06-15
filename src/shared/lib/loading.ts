export const MIN_LOADING_MS = 300;

export const waitForMinimumLoading = async (startedAt: number) => {
  const remainingMs = MIN_LOADING_MS - (Date.now() - startedAt);

  if (remainingMs <= 0) {
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, remainingMs));
};
