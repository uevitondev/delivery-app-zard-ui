import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { retry, timer, throwError, catchError } from 'rxjs';
import { ToastService } from '@/shared/components/toast/toast.service';

export const httpRetryInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    retry({
      count: 3,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        // Retry apenas para erros temporários de rede ou de servidor (5xx)
        const isNetworkError = error.status === 0;
        const isServerError = error.status >= 500 && error.status < 600;

        if (isNetworkError || isServerError) {
          // Backoff exponencial: 1s, 2s, 4s...
          const delayTime = Math.pow(2, retryCount) * 1000;

          // Notificar usuário apenas na segunda tentativa
          if (retryCount === 1) {
            toastService.info('Tentando reconectar...');
          }

          return timer(delayTime);
        }

        return throwError(() => error);
      },
    }),
    catchError((error: HttpErrorResponse) => {
      // Tratar erros de rede
      if (error.status === 0) {
        toastService.error('Sem conexão com a internet. Verifique sua rede.');
      }

      return throwError(() => error);
    }),
  );
};