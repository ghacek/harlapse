import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'timezoneOffset' })
export class TimezoneOffsetPipe implements PipeTransform {
  transform(value: number): string {
    const sign = value >= 0 ? '+' : '-';
    const absoluteValue = Math.abs(value);
    const hours = Math.floor(absoluteValue / 60);
    const minutes = absoluteValue % 60;

    return `UTC${sign}${padZero(hours)}:${padZero(minutes)}`;
  }
}

function padZero(value: number): string {
  return value.toString().padStart(2, '0');
}
