declare type Dictionary<T, K extends string | number = string> = K extends string ? {
    [key: string]: T;
} : {
    [key: number]: T;
};
export default Dictionary;
