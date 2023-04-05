import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'millisToHr'
})
export class MillisToHrPipe implements PipeTransform {

    transform(millis: number): string {
        if (millis <= 0) {
            return millis + "ms";
        }

        const ms = millis % 1000;

        const restSeconds = Math.floor(millis / 1000);

        const seconds = restSeconds % 60;

        const restMinutes = Math.floor(restSeconds / 1000);

        const minutes = restMinutes % 60;

        const hours = Math.floor(restMinutes / 60)

        

        let str = "";

        if (hours > 0) {
            str += hours + "h ";
        }
        if (minutes > 0) {
            str += minutes + "min ";
        }
        if (seconds > 0) {
            str += seconds + "s ";
        }
        if (ms > 0) {
            str += ms + "ms ";
        }

        return str;
    }

}