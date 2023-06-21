
const printMonth = (month: number) => {
    if (month < 10) {
        return '0' + month;
    } else {
        return month.toString();
    }
}

export class Calendar {

    date: Date;

    constructor(year: number, month: number, day: number) {
        const date = new Date(year, month - 1, day);
        date.setMinutes(0 - date.getTimezoneOffset());
        if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
            throw new Error(`illegal date: ${year}/${month}/${day} vs ${date.toISOString()}`);
        }
        this.date = date;
    }

    plusDays(days: number): Calendar {
        const date = new Date(this.date);
        date.setDate(date.getDate() + days);
        return new Calendar(date.getFullYear(), date.getMonth() + 1, date.getDate());
    }

    tommorow(): Calendar {
        return this.plusDays(1);
    }

    yesterday(): Calendar {
        return this.plusDays(-1);
    }

    diff(other: Calendar): number {

        let mul = -1;
        let sm: Calendar = this;
        let lg: Calendar = other;
        if (other.toString() < this.toString()) {
            sm = other;
            lg = this;
            mul = 1;
        }

        let counter = 0;
        while (sm.toString() < lg.toString()) {
            sm = sm.tommorow();
            counter++;
        }
        return counter * mul;
    }

    toString() {
        return `${this.date.getFullYear()}-${String(this.date.getMonth() + 1).padStart(2, '0')}-${String(this.date.getDate()).padStart(2, '0')}`
    }

    is(other: Calendar) {
        return this.toString() === other.toString();
    }

    rangeTo(other: Calendar): Calendar[] {
        let range: Calendar[] = [];
        let c: Calendar = this;
        for (; c.diff(other) < 0; c = c.tommorow()) {
            range.push(c);
        }
        return range;
    }
}

export function calendarFromDateStr(date: string) {
    const fromYear = parseInt(date.substring(0, 4));
    const fromMonth = parseInt(date.substring(5, 7));
    const fromDate = parseInt(date.substring(8));
    return new Calendar(fromYear, fromMonth, fromDate);
}

export function strToCal(date: string) {
    return calendarFromDateStr(date);
}

export function getDate(year: number, month: number, date: number) {
    return new Date(year, month - 1, date, 0, 0, 0, 0);
}
