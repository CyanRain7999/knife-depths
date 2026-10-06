// One captured finger controls movement; another can press the skill button.
export function bindMovementPad(pad: HTMLElement, onMove: (direction: number) => void, canMove: () => boolean) {
 let pointer: number | undefined, captured: HTMLElement | undefined;
 const buttons = Array.from(pad.querySelectorAll<HTMLButtonElement>('[data-move]'));
 function move(direction: number) {
  onMove(direction);
  buttons.forEach((button, index) => button.setAttribute('aria-pressed', String(direction === (index ? 1 : -1))));
 }
 function reset() {
  const previous = pointer;pointer = undefined;move(0);
  if(previous !== undefined && captured?.hasPointerCapture(previous))captured.releasePointerCapture(previous);
  captured = undefined;
 }
 function down(event: PointerEvent) {
  event.preventDefault();
  if(pointer !== undefined || !canMove() || event.button !== 0)return;
  const button=(event.target as Element).closest<HTMLButtonElement>('[data-move]');if(!button)return;
  pointer=event.pointerId;captured=button;button.setPointerCapture(pointer);
  move(button===buttons[0]?-1:1);
 }
 function drag(event: PointerEvent) {
  if(event.pointerId!==pointer)return;event.preventDefault();
  if(!canMove()){reset();return;}
  const box=pad.getBoundingClientRect(),offset=event.clientX-(box.left+box.width/2);
  move(Math.abs(offset)<6?0:Math.sign(offset));
 }
 function up(event: PointerEvent){if(event.pointerId===pointer){event.preventDefault();reset();}}
 const suppress=(event: Event)=>event.preventDefault();
 pad.addEventListener('pointerdown',down);pad.addEventListener('pointermove',drag);
 for(const event of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(event,up as EventListener);
 for(const event of ['contextmenu','selectstart','dragstart'])pad.addEventListener(event,suppress);
 move(0);
 return {reset,dispose(){reset();pad.removeEventListener('pointerdown',down);pad.removeEventListener('pointermove',drag);for(const event of ['pointerup','pointercancel','lostpointercapture'])pad.removeEventListener(event,up as EventListener);for(const event of ['contextmenu','selectstart','dragstart'])pad.removeEventListener(event,suppress);}};
}
