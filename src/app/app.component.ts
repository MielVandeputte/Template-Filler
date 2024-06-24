import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, ReactiveFormsModule, FormsModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    inputs: string[] = [];
    result = '';

    templateForm = new FormGroup({
        template: new FormControl(''),
    });

    changeSetForm: FormGroup = new FormGroup({
        name: new FormControl(''),
        ticket: new FormControl(''),
    });

    dynamicInputsForm: FormGroup = new FormGroup({});

    constructor() {
        this.templateForm.get('template')?.valueChanges.subscribe((template) => {
            this.updateInputs(this.deriveInputNamesFromTemplate(template));
            this.updateResult();
        });

        this.changeSetForm.valueChanges.subscribe((_) => this.updateResult());
    }

    deriveInputNamesFromTemplate(template: string | null) {
        if (!template) return [];

        const templateExpressions = template.matchAll(/{{(.*?)}}/g);
        return Array.from(templateExpressions)
            .map((value) => value[1].trim())
            .filter((value) => !!value);
    }

    updateInputs(inputs: string[]) {
        this.inputs = inputs;

        this.dynamicInputsForm = new FormGroup(
            inputs.reduce(
                (acc, input) => {
                    acc[input] = new FormControl('');
                    return acc;
                },
                {} as { [key: string]: FormControl }
            )
        );

        this.dynamicInputsForm.valueChanges.subscribe((_) => this.updateResult());
    }

    updateResult() {
        let innerTemplate = this.templateForm.get('template')?.value ?? '';

        for (const input of this.inputs) {
            innerTemplate = innerTemplate.replaceAll(`{{${input}}}`, this.dynamicInputsForm.get(input)?.value ?? '');
        }

        const name = this.changeSetForm.get('name')?.value;
        const ticket = this.changeSetForm.get('ticket')?.value;

        this.result = this.wrapInOuter(this.wrapInChangeSet(innerTemplate, ticket, name));
    }

    wrapInChangeSet(inner: string, ticket: string, name: string) {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
        const day = ('0' + currentDate.getDate()).slice(-2);

        const dateString: string = `${year}${month}${day}`;

        const upper = `<changeSet id="${dateString}_${ticket}" author="${name}">\n`;
        const lower = '\n</changeSet>';

        return upper + inner + lower;
    }

    wrapInOuter(inner: string) {
        const upper =
            '<?xml version="1.0" encoding="UTF-8"?>\n<databaseChangeLog\nxmlns="http://www.liquibase.org/xml/ns/dbchangelog"\nxmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\nxsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog\nhttp://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.9.xsd">\n\n';
        const lower = '\n\n</databaseChangeLog>';

        return upper + inner + lower;
    }
}
