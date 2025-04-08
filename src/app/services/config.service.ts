import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    constructor(private http: HttpClient, private titleService: Title) {}

    async loadAppConfig(): Promise<void> {
        const config: any = await firstValueFrom(this.http.get('app-config.json'));
        if (config?.title) {
            this.titleService.setTitle(config.title);
        }
    }
}
