import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'splitCamelCase',
    standalone: true
})
export class SplitCamelCasePipe implements PipeTransform {
    transform(value: string): string {
        if (!value) return value;

        // Add space before capital letters (except the first one)
        return value.replace(/([A-Z])/g, ' $1').trim();
    }
}
