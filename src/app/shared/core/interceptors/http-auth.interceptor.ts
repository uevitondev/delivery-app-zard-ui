import { HttpInterceptorFn } from '@angular/common/http';
import { retry, timer, throwError } from 'rxjs';

export const httpAuthInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    retry({
      count: 3,
      delay: (error, retryCount) => {
        // Retry apenas para erros temporários de rede ou de servidor (5xx)
        if (error.status === 0 || (error.status >= 500 && error.status < 600)) {
          // Backoff exponencial: 1s, 2s, 4s...
          const delayTime = Math.pow(2, retryCount) * 1000;
          return timer(delayTime);
        }
        return throwError(() => error);
      },
    })
  );
};
