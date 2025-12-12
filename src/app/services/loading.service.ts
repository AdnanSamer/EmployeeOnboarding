import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loading$ = new BehaviorSubject<boolean>(false);
  private message$ = new BehaviorSubject<string>('');

  show(message?: string): void {
    if (message) {
      this.message$.next(message);
    }
    this.loading$.next(true);
  }

  hide(): void {
    this.loading$.next(false);
    this.message$.next('');
  }

  isLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  getMessage(): Observable<string> {
    return this.message$.asObservable();
  }
}


