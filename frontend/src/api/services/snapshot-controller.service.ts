/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpContext } from '@angular/common/http';
import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';
import { RequestBuilder } from '../request-builder';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { CreateSnapshotResult } from '../models/create-snapshot-result';
import { SnapshotInfo } from '../models/snapshot-info';

@Injectable({
  providedIn: 'root',
})
export class SnapshotControllerService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation createNewSnapshot
   */
  static readonly CreateNewSnapshotPath = '/api/snapshot';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `createNewSnapshot()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  createNewSnapshot$Response(params?: {
    body?: {
'title'?: string;
'url'?: string;
}
  },
  context?: HttpContext

): Observable<StrictHttpResponse<CreateSnapshotResult>> {

    const rb = new RequestBuilder(this.rootUrl, SnapshotControllerService.CreateNewSnapshotPath, 'post');
    if (params) {
      rb.body(params.body, 'multipart/form-data');
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json',
      context: context
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<CreateSnapshotResult>;
      })
    );
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `createNewSnapshot$Response()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  createNewSnapshot(params?: {
    body?: {
'title'?: string;
'url'?: string;
}
  },
  context?: HttpContext

): Observable<CreateSnapshotResult> {

    return this.createNewSnapshot$Response(params,context).pipe(
      map((r: StrictHttpResponse<CreateSnapshotResult>) => r.body as CreateSnapshotResult)
    );
  }

  /**
   * Path part for operation getShanpshotInfo
   */
  static readonly GetShanpshotInfoPath = '/api/snapshot/{ref}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getShanpshotInfo()` instead.
   *
   * This method doesn't expect any request body.
   */
  getShanpshotInfo$Response(params: {
    ref: string;
  },
  context?: HttpContext

): Observable<StrictHttpResponse<SnapshotInfo>> {

    const rb = new RequestBuilder(this.rootUrl, SnapshotControllerService.GetShanpshotInfoPath, 'get');
    if (params) {
      rb.path('ref', params.ref, {});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json',
      context: context
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<SnapshotInfo>;
      })
    );
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getShanpshotInfo$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getShanpshotInfo(params: {
    ref: string;
  },
  context?: HttpContext

): Observable<SnapshotInfo> {

    return this.getShanpshotInfo$Response(params,context).pipe(
      map((r: StrictHttpResponse<SnapshotInfo>) => r.body as SnapshotInfo)
    );
  }

  /**
   * Path part for operation getSnapshotAnnotationsConfig
   */
  static readonly GetSnapshotAnnotationsConfigPath = '/api/snapshot/{ref}/annotations-config';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getSnapshotAnnotationsConfig()` instead.
   *
   * This method doesn't expect any request body.
   */
  getSnapshotAnnotationsConfig$Response(params: {
    ref: string;
  },
  context?: HttpContext

): Observable<StrictHttpResponse<Blob>> {

    const rb = new RequestBuilder(this.rootUrl, SnapshotControllerService.GetSnapshotAnnotationsConfigPath, 'get');
    if (params) {
      rb.path('ref', params.ref, {});
    }

    return this.http.request(rb.build({
      responseType: 'blob',
      accept: 'application/json',
      context: context
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Blob>;
      })
    );
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getSnapshotAnnotationsConfig$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getSnapshotAnnotationsConfig(params: {
    ref: string;
  },
  context?: HttpContext

): Observable<Blob> {

    return this.getSnapshotAnnotationsConfig$Response(params,context).pipe(
      map((r: StrictHttpResponse<Blob>) => r.body as Blob)
    );
  }

  /**
   * Path part for operation getSnapshotAnnotationsSvg
   */
  static readonly GetSnapshotAnnotationsSvgPath = '/api/snapshot/{ref}/annotations-svg';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getSnapshotAnnotationsSvg()` instead.
   *
   * This method doesn't expect any request body.
   */
  getSnapshotAnnotationsSvg$Response(params: {
    ref: string;
  },
  context?: HttpContext

): Observable<StrictHttpResponse<Blob>> {

    const rb = new RequestBuilder(this.rootUrl, SnapshotControllerService.GetSnapshotAnnotationsSvgPath, 'get');
    if (params) {
      rb.path('ref', params.ref, {});
    }

    return this.http.request(rb.build({
      responseType: 'blob',
      accept: 'image/svg+xml',
      context: context
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Blob>;
      })
    );
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getSnapshotAnnotationsSvg$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getSnapshotAnnotationsSvg(params: {
    ref: string;
  },
  context?: HttpContext

): Observable<Blob> {

    return this.getSnapshotAnnotationsSvg$Response(params,context).pipe(
      map((r: StrictHttpResponse<Blob>) => r.body as Blob)
    );
  }

  /**
   * Path part for operation finalizeSnapshotCapture
   */
  static readonly FinalizeSnapshotCapturePath = '/api/snapshot/{ref}/finalize-capture';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `finalizeSnapshotCapture()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  finalizeSnapshotCapture$Response(params: {
    ref: string;
    body?: {
'title'?: string;
'description'?: string;
'annotations-config'?: Blob;
'annotations-svg'?: Blob;
}
  },
  context?: HttpContext

): Observable<StrictHttpResponse<void>> {

    const rb = new RequestBuilder(this.rootUrl, SnapshotControllerService.FinalizeSnapshotCapturePath, 'post');
    if (params) {
      rb.path('ref', params.ref, {});
      rb.body(params.body, 'multipart/form-data');
    }

    return this.http.request(rb.build({
      responseType: 'text',
      accept: '*/*',
      context: context
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return (r as HttpResponse<any>).clone({ body: undefined }) as StrictHttpResponse<void>;
      })
    );
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `finalizeSnapshotCapture$Response()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  finalizeSnapshotCapture(params: {
    ref: string;
    body?: {
'title'?: string;
'description'?: string;
'annotations-config'?: Blob;
'annotations-svg'?: Blob;
}
  },
  context?: HttpContext

): Observable<void> {

    return this.finalizeSnapshotCapture$Response(params,context).pipe(
      map((r: StrictHttpResponse<void>) => r.body as void)
    );
  }

}
