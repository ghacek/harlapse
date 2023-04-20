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

import { NewHarResponse } from '../models/new-har-response';
import { Snapshot } from '../models/snapshot';

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
'ss'?: Blob;
'har'?: Blob;
'console'?: Blob;
}
  },
  context?: HttpContext

): Observable<StrictHttpResponse<NewHarResponse>> {

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
        return r as StrictHttpResponse<NewHarResponse>;
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
'ss'?: Blob;
'har'?: Blob;
'console'?: Blob;
}
  },
  context?: HttpContext

): Observable<NewHarResponse> {

    return this.createNewSnapshot$Response(params,context).pipe(
      map((r: StrictHttpResponse<NewHarResponse>) => r.body as NewHarResponse)
    );
  }

  /**
   * Path part for operation hello
   */
  static readonly HelloPath = '/api/snapshot/hello';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `hello()` instead.
   *
   * This method doesn't expect any request body.
   */
  hello$Response(params?: {
  },
  context?: HttpContext

): Observable<StrictHttpResponse<string>> {

    const rb = new RequestBuilder(this.rootUrl, SnapshotControllerService.HelloPath, 'get');
    if (params) {
    }

    return this.http.request(rb.build({
      responseType: 'text',
      accept: 'text/plain',
      context: context
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<string>;
      })
    );
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `hello$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  hello(params?: {
  },
  context?: HttpContext

): Observable<string> {

    return this.hello$Response(params,context).pipe(
      map((r: StrictHttpResponse<string>) => r.body as string)
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

): Observable<StrictHttpResponse<Snapshot>> {

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
        return r as StrictHttpResponse<Snapshot>;
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

): Observable<Snapshot> {

    return this.getShanpshotInfo$Response(params,context).pipe(
      map((r: StrictHttpResponse<Snapshot>) => r.body as Snapshot)
    );
  }

  /**
   * Path part for operation getSnapshotConsoleLog
   */
  static readonly GetSnapshotConsoleLogPath = '/api/snapshot/{ref}/console';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getSnapshotConsoleLog()` instead.
   *
   * This method doesn't expect any request body.
   */
  getSnapshotConsoleLog$Response(params: {
    ref: string;
  },
  context?: HttpContext

): Observable<StrictHttpResponse<{
}>> {

    const rb = new RequestBuilder(this.rootUrl, SnapshotControllerService.GetSnapshotConsoleLogPath, 'get');
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
        return r as StrictHttpResponse<{
        }>;
      })
    );
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getSnapshotConsoleLog$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getSnapshotConsoleLog(params: {
    ref: string;
  },
  context?: HttpContext

): Observable<{
}> {

    return this.getSnapshotConsoleLog$Response(params,context).pipe(
      map((r: StrictHttpResponse<{
}>) => r.body as {
})
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

  /**
   * Path part for operation getSnapshotNetwork
   */
  static readonly GetSnapshotNetworkPath = '/api/snapshot/{ref}/network';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getSnapshotNetwork()` instead.
   *
   * This method doesn't expect any request body.
   */
  getSnapshotNetwork$Response(params: {
    ref: string;
  },
  context?: HttpContext

): Observable<StrictHttpResponse<{
}>> {

    const rb = new RequestBuilder(this.rootUrl, SnapshotControllerService.GetSnapshotNetworkPath, 'get');
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
        return r as StrictHttpResponse<{
        }>;
      })
    );
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getSnapshotNetwork$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getSnapshotNetwork(params: {
    ref: string;
  },
  context?: HttpContext

): Observable<{
}> {

    return this.getSnapshotNetwork$Response(params,context).pipe(
      map((r: StrictHttpResponse<{
}>) => r.body as {
})
    );
  }

  /**
   * Path part for operation getSnapshotScreenshot
   */
  static readonly GetSnapshotScreenshotPath = '/api/snapshot/{ref}/screenshot';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getSnapshotScreenshot()` instead.
   *
   * This method doesn't expect any request body.
   */
  getSnapshotScreenshot$Response(params: {
    ref: string;
  },
  context?: HttpContext

): Observable<StrictHttpResponse<Blob>> {

    const rb = new RequestBuilder(this.rootUrl, SnapshotControllerService.GetSnapshotScreenshotPath, 'get');
    if (params) {
      rb.path('ref', params.ref, {});
    }

    return this.http.request(rb.build({
      responseType: 'blob',
      accept: 'image/png',
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
   * To access the full response (for headers, for example), `getSnapshotScreenshot$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getSnapshotScreenshot(params: {
    ref: string;
  },
  context?: HttpContext

): Observable<Blob> {

    return this.getSnapshotScreenshot$Response(params,context).pipe(
      map((r: StrictHttpResponse<Blob>) => r.body as Blob)
    );
  }

}
