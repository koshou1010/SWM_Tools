import { Directive, ElementRef, Renderer2, HostBinding, Input  } from '@angular/core';

@Directive({
  selector: '[app-button]'
})
export class ButtonDirective {

  @HostBinding('style.background-color') backgroundColor = '#00b3ba';
  @HostBinding('style.color') color = '#ffffff';
  @HostBinding('style.border') border = 'none';
  @HostBinding('style.padding') padding = '2px 10px';
  @HostBinding('style.cursor') cursor = 'pointer';
  @Input() disabled: boolean = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.addClass(this.el.nativeElement, 'mat-button');
  }

  ngOnChanges() {
    if (this.disabled) {
      this.backgroundColor = '#cccccc';
      this.color = '#666666';
      this.cursor = 'not-allowed'; 
    } else {
      this.backgroundColor = '#00b3ba';
      this.color = '#ffffff';
      this.cursor = 'pointer';
    }
  }
}
