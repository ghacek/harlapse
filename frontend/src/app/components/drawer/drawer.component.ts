import { Component, ContentChild, HostBinding, HostListener, Input, TemplateRef, ViewChild } from '@angular/core';
import { EscKeyScopeService, EscKeySubscription } from 'src/app/services/esc-key-scope.service';

@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss']
})
export class DrawerComponent {

    @Input()
    title: string = "";

    /** If true, will show overlay with loading indicator over whole drawer content. */
    @Input()
    public showLoadingOverlay: boolean = false;

    /** If true, will show overlay over whole drawer content. */
    @Input()
    public showOverlay: boolean = false;

    
    @HostBinding('class.visible')
    _visible: boolean = false;

    private escSubscription?: EscKeySubscription;

    @Input()
    public set visible(visible: boolean) {
        if (visible == this._visible) {
            return;
        }

        if (visible) {
            this.escSubscription = this.escKeyService.subscribe(() => this.visible = false );
        } else {
            this.escSubscription?.unsubscribe();
        }
        
        this._visible = visible;
    }

    public get visible() {
        return this._visible;
    }

    
    @ContentChild("header") 
    header!: TemplateRef<unknown>;

    @ContentChild("content") 
    content!: TemplateRef<unknown>;

    /** 
     * Template that is position at the bottom of the sidebar. It is has fixed 
     * position no matter content size. 
     * */
    @ContentChild("footer") 
    footer!: TemplateRef<unknown>;

    /** 
     * Buttons templet is position beneath the footer and is expected to contain
     * .hy-btn buttons, which are most common footer content of the sidebar. 
     */
    @ContentChild("buttons") 
    buttons!: TemplateRef<unknown>;
    
    constructor(private escKeyService: EscKeyScopeService) {
    }

    @HostListener("click")
    close() {
        this.visible = false;
    }
}
