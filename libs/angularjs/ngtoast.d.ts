/**
 * Created by christopher on 22/07/15.
 */
declare module ng.toast {

	export interface IToastOptions {
		content? : string; //	''	Content of the toast message as string (HTML is supported). (string)
		className? : string; //	'success'	Class name to be added on toast message with 'alert-' prefix. See Bootstrap Alerts for possible options. (string)
		dismissOnTimeout? : boolean; //	true	Allows toast messages to be removed automatically after a specified time. (boolean)
		timeout? : number;//	4000	Wait time for removal of created toast message. (number)
		dismissButton? : boolean;//	false	Appends specified close button on toast message. (boolean)
		dismissButtonHtml? : string;//	'&times;'	HTML of close button to append. (string)
		dismissOnClick? : boolean;//	true	Allows toasts messages to be removed on mouse click. (boolean)
		compileContent? : boolean|Object;//	false	Re-compiles the toast message content within parent (or given) scope. Needs to be used with trusted HTML content. See here for more information. (boolean|object)
		animation? : string; //*	''	Built-in animation type for toast messages: 'slide' or 'fade' (string)
		additionalClasses? : string; //*	''	Additional class name(s) to add toast messages. (string)
		horizontalPosition? : string; //*	'right'	Horizontal position of toast messages: 'right', 'left' or 'center' (string)
		verticalPosition? : string; //*	'top'	Vertical position of toast messages: 'top' or 'bottom' (string)
		maxNumber? : number; //Maximum number of toast messages to display. (0 = no limit) (number)
	}

	export interface IToastMessage {

	}

	export interface IToastService {
		create(options : IToastOptions | string) : IToastMessage;
		success(options : IToastOptions | string) : IToastMessage;
		info(options : IToastOptions | string) : IToastMessage;
		warning(options : IToastOptions | string) : IToastMessage;
		danger(options : IToastOptions | string) : IToastMessage;
		dismiss(message? : IToastMessage);
		configure(message? : IToastOptions);
	}
}