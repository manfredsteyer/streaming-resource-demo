import { Directive, ElementRef, inject, OnInit } from '@angular/core';

@Directive({ selector: '[appFocus]' })
export class FocusDirective implements OnInit  {
    elm = inject<ElementRef<HTMLInputElement>>(ElementRef);
    ngOnInit(): void {
        this.elm.nativeElement.focus();
    }
}
