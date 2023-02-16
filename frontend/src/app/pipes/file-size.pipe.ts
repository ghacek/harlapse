import { Pipe, PipeTransform } from '@angular/core';

const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

@Pipe({
  name: 'fileSize'
})
export class FileSizePipe implements PipeTransform {

  transform(sizeInBytes: number): string {
    if (sizeInBytes < 0) {
        return sizeInBytes.toString();
    }
    if (sizeInBytes === 0) {
      return '0 B';
    }
    
    const exp = Math.floor(Math.log(sizeInBytes) / Math.log(1000));
    const sizeInUnits = Number((sizeInBytes / Math.pow(1000, exp)).toFixed(2));
    return sizeInUnits + ' ' + units[exp];
  }

}