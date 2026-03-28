import { HttpInterceptorFn } from '@angular/common/http';

export const httpAuthInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
