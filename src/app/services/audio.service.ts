import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TimelineBackgroundAudio } from 'app/models/timeline.model';

export interface AudioState {
    isPlaying: boolean;
    currentAudio: string | null;
    volume: number;
    isMuted: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class AudioService {
    // HTML elements for app and era background audio
    private audioElement: HTMLAudioElement | null = null;

    // Current background audio (app or era)
    private currentBackgroundAudios: TimelineBackgroundAudio[] | null = null;
    private currentBackgroundAudioIndex: number = 0;

    // Available background audio (app)
    private availableAppBackgroundAudios: TimelineBackgroundAudio[] | null = null;

    // Audio state subject
    private audioStateSubject = new BehaviorSubject<AudioState>({
        isPlaying: false,
        currentAudio: null,
        volume: 0.5,
        isMuted: false,
    });

    public audioState$: Observable<AudioState> =
        this.audioStateSubject.asObservable();

    constructor() {
        this.initializeAudioElement();
    }

    /**
     * Initialize the audio element for background audio
     */
    private initializeAudioElement(): void {
        // Create background audio element
        this.audioElement = new Audio();
        this.audioElement.preload = 'auto';
        this.audioElement.volume = this.audioStateSubject.value.volume;

        // Set up event listeners for background audio
        this.setupAudioEventListeners(this.audioElement);
    }

    /**
     * Initialize background audio
     */
    public async initializeAppBackgroundAudio(
          backgroundAudios: TimelineBackgroundAudio[] | null
    ): Promise<void> {
        console.debug('Initializing background audio:', backgroundAudios);
        if (backgroundAudios && backgroundAudios.length > 0) {
            this.availableAppBackgroundAudios = backgroundAudios;
            this.currentBackgroundAudios = backgroundAudios;
            this.currentBackgroundAudioIndex = 0;
        }
    }

    /**
     * Get the app background audio element
     */
    public getAudioElement(): HTMLAudioElement | null {
        return this.audioElement;
    }

    /**
     * Get the current app audio
     */
    public getCurrentBackgroundAudio(): TimelineBackgroundAudio | null {
        return this.currentBackgroundAudios?.[this.currentBackgroundAudioIndex] || null;
    }

    /**
     * Set up event listeners for audio elements
     */
    private setupAudioEventListeners(audioElement: HTMLAudioElement): void {
        audioElement.addEventListener('ended', () => {
          if (this.currentBackgroundAudioIndex < (this.currentBackgroundAudios?.length || 0) - 1) {
            this.currentBackgroundAudioIndex++;
          } else {
            this.currentBackgroundAudioIndex = 0;
          }
          this.playBackgroundAudio();
        });

        audioElement.addEventListener('play', () => {
            this.updateAudioState({ isPlaying: true });
        });

        audioElement.addEventListener('pause', () => {
            this.updateAudioState({ isPlaying: false });
        });

        audioElement.addEventListener('error', (error) => {
            console.error(`Error playing background audio:`, error);
            this.updateAudioState({ isPlaying: false });
        });
    }

    /**
     * Play background audio
     */
    public playBackgroundAudio(): Promise<void> {
        return new Promise((resolve, reject) => {
          if (this.currentBackgroundAudioIndex < 0 || this.currentBackgroundAudioIndex >= (this.currentBackgroundAudios?.length || 0)) {
            console.warn('Current background audio index is out of bounds, resetting to 0');
            this.currentBackgroundAudioIndex = 0;
          }
          // Try era audio first if available
          if (this.currentBackgroundAudios && this.currentBackgroundAudios.length > 0) {
            this.audioElement!.src = this.currentBackgroundAudios[this.currentBackgroundAudioIndex].url;
            this.audioElement!.loop = true;
            this.audioElement!.play().then(() => {
              this.updateAudioState({ isPlaying: true });
              resolve();
            }).catch(reject);
          } else {
            this.updateAudioState({ isPlaying: false });
            resolve();
          }
        });
    }

    /**
     * Stop app background audio
     */
    public pauseBackgroundAudio(): void {
        if (this.audioElement) {
            this.audioElement.pause();
        }
        this.updateAudioState({ isPlaying: false });
    }

    /**
     * Set volume for all audio elements
     */
    public setVolume(volume: number): void {
        const clampedVolume = Math.max(0, Math.min(1, volume));

        if (this.audioElement) {
            this.audioElement.volume = clampedVolume;
        }

        this.updateAudioState({ volume: clampedVolume });
    }

    /**
     * Mute/unmute all audio
     */
    public setMuted(muted: boolean): void {
        const volume = muted ? 0 : this.audioStateSubject.value.volume;

        if (this.audioElement) {
            this.audioElement.volume = volume;
        }

        this.updateAudioState({ isMuted: muted });
    }

    /**
     * Get current volume
     */
    public getVolume(): number {
        return this.audioStateSubject.value.volume;
    }

    /**
     * Check if audio is muted
     */
    public isMuted(): boolean {
        return this.audioStateSubject.value.isMuted;
    }

    /**
     * Check if any audio is currently playing
     */
    public isPlaying(): boolean {
        return this.audioStateSubject.value.isPlaying;
    }

    /**
     * Get current audio state
     */
    public getAudioState(): AudioState {
        return this.audioStateSubject.value;
    }

    /**
     * Update audio state and emit to subscribers
     */
    private updateAudioState(updates: Partial<AudioState>): void {
        const currentState = this.audioStateSubject.value;
        const newState = { ...currentState, ...updates };
        this.audioStateSubject.next(newState);
    }

    /**
     * Handle era change - play era audio if available, otherwise fall back to app audio
     */
    public async handleEraChange(
        eraAudios: TimelineBackgroundAudio[],
    ): Promise<void> {
        console.debug('Handling era change audio:', eraAudios);
        if (JSON.stringify(this.currentBackgroundAudios) === JSON.stringify(eraAudios)) {
            // era audio is already active, so do nothing
            console.debug('Era audio is already active, so do nothing');
            return;
        }
        if (eraAudios && eraAudios.length > 0) {
            this.switchEraAudio(eraAudios);
        } else {
            this.handleChangeToEraWithoutAudio();
        }
    }

    switchEraAudio(eraAudios: TimelineBackgroundAudio[]): void {
        if (!eraAudios || eraAudios.length <= 0) {
            console.warn('No era audio provided, using app audio');
            return;
        }

        console.debug('Switching to era audio:', eraAudios);
        // Set or replace current background audios
        this.currentBackgroundAudios = eraAudios;
        // Use first era audio if available
        this.currentBackgroundAudioIndex = 0;
        // If audio is playing, switch to era audio
        if (this.audioStateSubject.value.isPlaying) {
            this.playBackgroundAudio();
        }
    }

    handleChangeToEraWithoutAudio(): void {
        console.debug('Switching to era without audio, using app audio');
        // if no audio for this new era, use app audio
        console.debug('Current background audios:', this.currentBackgroundAudios);
        console.debug('Available app background audios:', this.availableAppBackgroundAudios);
        if (JSON.stringify(this.currentBackgroundAudios) === JSON.stringify(this.availableAppBackgroundAudios)) {
            // app background audio is still active, so do nothing
            console.debug('current and app background audios are the same, so do nothing');
            return;
        } else {
            // switch to app background audios if available
            if (!this.availableAppBackgroundAudios || this.availableAppBackgroundAudios.length <= 0) {
                console.warn('No app background audios provided, stopping audio');
                return;
            }

            console.debug('Switching to app background audios');
            this.currentBackgroundAudios = this.availableAppBackgroundAudios;
            this.currentBackgroundAudioIndex = 0;
            if (this.audioStateSubject.value.isPlaying) {
                this.playBackgroundAudio();
            }
        }
    }

    /**
     * Clean up resources
     */
    public destroy(): void {
        this.pauseBackgroundAudio();

        if (this.audioElement) {
            this.audioElement.remove();
            this.audioElement = null;
        }

        this.audioStateSubject.complete();
    }
}
