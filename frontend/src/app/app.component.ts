import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'harbin';

  constructor(private http: HttpClient) {
    http.get("http://localhost:8080/api/har?id=093ffcb3f1004ec2a51931afd03c695b").subscribe(x => console.log(x))
  }
}
