export const intro = "INTRO";
export const version = "VERSION";

export const step = (message: string, ...params: string[]) => {
  console.log(message, ...params);
};

export const error = (message: string) => message;

export const fetchDefinitions = async () =>
  Promise.resolve({
    version: 1,
    features: [],
  });
