export interface Tale {
    title: { text: { headline: string; }; background: { url: string; }; };
    eras: Era[];
}

export interface Era {
    title: { headline: string, text: string; };
    events: Event[];
    background: { url: string };
}

export interface Event {
    start_date: { year: number, month: number, day: number };
    end_date: { year: number, month: number, day: number };
    display_date: string;
    exact_date: boolean;
    text: { headline: string, description: string };
    media: { url: string, caption: string, credit: string };
}
