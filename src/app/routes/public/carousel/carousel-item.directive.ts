import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[wsCarouselItem]'
})
export class CarouselItemDirective {

  constructor(public tpl: TemplateRef<any>) { }

}
