import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class IpService  {
  url = '';
  constructor(private http: HttpClient) {
    this.url = `http://api.ipify.org/?format=json`;
  }

  public getIPAddress()
  {
      return this.http.get(`${this.url}`);
  }
}
