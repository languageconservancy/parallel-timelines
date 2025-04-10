export interface TimelineData {
    eras: TimelineEra[];
}

export interface TimelineEra {
    id?: number;
    type?: string;
    title?: { headline?: string },
    singleBackground?: TimelineBackground,
    mainEventsBackground?: TimelineBackground,
    comparativeEventsBackground?: TimelineBackground,
    eventGroups: TimelineEventGroup[];
}

export interface TimelineEventGroup {
    id?: number;
    title?: { headline?: string };
    mainEvents: TimelineEvent[];
    comparativeEvents: TimelineEvent[];
}

export interface TimelineEvent {
    id?: number;
    date: string;
    text: {
        headline: string;
        text: string;
    };
    image?: {
        url: string;
        caption?: string;
    }
}

export interface TimelineBackground {
    url?: string;
    color?: string;
}

export interface TimelineFlattenedEventGroup {
    type?: string;
    id?: number;
    eraId?: number;
    eraTitle?: { headline?: string };
    singleBackground?: TimelineBackground;
    mainEventsBackground?: TimelineBackground;
    comparativeEventsBackground?: TimelineBackground;
    title?: { headline?: string };
    mainEvents: TimelineEvent[];
    comparativeEvents: TimelineEvent[];
}

export interface DrawerCard {
    id: number;
    eventGroupIndex: number;
    title: string;
    background: TimelineBackground;
}
