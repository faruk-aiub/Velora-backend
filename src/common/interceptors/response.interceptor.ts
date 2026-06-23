import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  meta: any;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((res) => {
        // If the response is already our standard format (e.g. from pagination util), unwrap it
        if (res && typeof res === 'object' && ('data' in res) && ('meta' in res)) {
          return {
            success: true,
            message: res.message || '',
            data: res.data,
            meta: res.meta,
          };
        }

        // Default wrapping for normal responses
        return {
          success: true,
          message: res?.message || '',
          data: res?.data ?? res ?? null, // If response has a data field, use it, else use the whole response
          meta: res?.meta || {},
        };
      }),
    );
  }
}
