import Dictionary from 'vue-airbnb-calendar/types/dictionary';
import Options from './options';
export interface StaticDateInfo {
    reservation: boolean;
    checkIn: boolean;
    checkOut: boolean;
}
export declare type Analysis = Dictionary<StaticDateInfo, number>;
export declare const getInfo: (date: Date, analysis: {
    [key: number]: StaticDateInfo;
}) => StaticDateInfo;
export declare const analyzeOptions: <F extends string | undefined>(options?: Options<F> | undefined) => {
    [key: number]: StaticDateInfo;
};
