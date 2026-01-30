export interface TimelineData {
    appBackgroundAudios?: TimelineBackgroundAudio[];
    eras: TimelineEra[];
}

export interface TimelineEra {
    id?: number;
    type?: string;
    title?: { headline?: string };
    mainEventsBackground?: TimelineBackground;
    comparativeEventsBackground?: TimelineBackground;
    eventGroups: TimelineEventGroup[];
    backgroundAudios?: TimelineBackgroundAudio[];
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
        brief: string;
        text: string;
    };
    image?: TimelineEventImage;
}

export interface TimelineBackground {
    url?: string;
    color?: string;
    credit?: string;
}

export interface TimelineEventImage {
    url: string;
    caption?: string;
    position?: string;
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

export interface TimelineBackgroundAudio {
    url: string;
}

