import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ReactiveFormsModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'template-filler';
  inputs: string[] = [];

  templateForm = new FormGroup({
    template: new FormControl('')
  });

  constructor() {
    this.templateForm.valueChanges.subscribe(value => {
      const templateExpressions = value.template?.matchAll(/{{(.*)}}/g);

      this.inputs = [];
      for (const nextVal of templateExpressions ?? []) {
        nextVal[1] && this.inputs.push(nextVal[1]);
      }
    });
  }
}
