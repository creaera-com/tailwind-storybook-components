import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Button,
  ButtonGroup,
  Checkbox,
  Chip,
  Dropdown,
  OptionButton,
  Radio,
  ToggleSwitch,
} from '../index';

@Component({
  imports: [Button],
  template:
    '<form (submit)="submitted = true"><button uiButton (click)="clicked = true">Save</button></form>',
})
class ButtonHost {
  submitted = false;
  clicked = false;
}
@Component({
  imports: [Button, Chip],
  template: '<button uiButton type="submit">Save</button><button uiChip>Tag</button>',
})
class NativeActionsHost {}
@Component({
  imports: [Checkbox, ReactiveFormsModule],
  template: '<ui-checkbox [formControl]="control">Accept terms</ui-checkbox>',
})
class CheckboxHost {
  control = new FormControl(false);
}
@Component({
  imports: [ToggleSwitch, ReactiveFormsModule],
  template: '<ui-switch [formControl]="control">Autosave</ui-switch>',
})
class SwitchHost {
  control = new FormControl(false);
}
@Component({
  imports: [Checkbox],
  template: '<ui-checkbox [(checked)]="checked">Accept</ui-checkbox>',
})
class ModelHost {
  checked = false;
}
@Component({
  imports: [Radio, ReactiveFormsModule],
  template:
    '<label><input type="radio" uiRadio name="delivery" value="standard" [formControl]="control" />Standard</label><label><input type="radio" uiRadio name="delivery" value="express" [formControl]="control" />Express</label>',
})
class RadioHost {
  control = new FormControl('standard');
}

const options = [
  { value: 'one', label: 'One' },
  { value: 'no', label: 'Unavailable', disabled: true },
  { value: 'two', label: 'Two' },
];
afterEach(() => {
  TestBed.resetTestingModule();
  vi.useRealTimers();
});

describe('native actions', () => {
  it('does not submit a form by default and retains native click behavior', () => {
    const fixture = TestBed.createComponent(ButtonHost);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    expect(fixture.componentInstance.clicked).toBe(true);
    expect(fixture.componentInstance.submitted).toBe(false);
  });
  it('supports disabled native buttons and explicit submit type', () => {
    const fixture = TestBed.createComponent(NativeActionsHost);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.type).toBe('submit');
    button.disabled = true;
    const listener = vi.fn();
    button.addEventListener('click', listener);
    button.click();
    expect(listener).not.toHaveBeenCalled();
  });
  it('keeps chips as non-submitting native actions', () => {
    const fixture = TestBed.createComponent(NativeActionsHost);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[uiChip]').type).toBe('button');
  });
});

describe('checkbox and switch Forms integration', () => {
  for (const [name, host] of [
    ['checkbox', CheckboxHost],
    ['switch', SwitchHost],
  ] as const) {
    it(`${name}: synchronizes user and programmatic values, blur and disabled state`, async () => {
      const fixture = TestBed.createComponent(host);
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.control.value).toBe(true);
      fixture.componentInstance.control.setValue(false);
      fixture.detectChanges();
      expect(input.checked).toBe(false);
      input.dispatchEvent(new Event('blur'));
      expect(fixture.componentInstance.control.touched).toBe(true);
      fixture.componentInstance.control.disable();
      fixture.detectChanges();
      expect(input.disabled).toBe(true);
      input.click();
      expect(fixture.componentInstance.control.value).toBe(false);
      fixture.componentInstance.control.enable();
      fixture.detectChanges();
      expect(input.disabled).toBe(false);
      expect(input.closest('label')?.textContent?.trim().length).toBeGreaterThan(0);
    });
  }
  it('supports checked two-way binding without Forms', () => {
    const fixture = TestBed.createComponent(ModelHost);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('input').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.checked).toBe(true);
  });
  it('uses native radio grouping and Angular radio value accessors', () => {
    const fixture = TestBed.createComponent(RadioHost);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    expect(inputs[0].checked).toBe(true);
    inputs[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('express');
    expect(inputs[0].checked).toBe(false);
  });
});

describe('button group', () => {
  function setup(multiple = false) {
    const fixture = TestBed.createComponent(ButtonGroup);
    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('label', 'View');
    fixture.componentRef.setInput('multiple', multiple);
    fixture.detectChanges();
    return fixture;
  }
  it('selects only one value in single mode and exposes radio semantics', () => {
    const fixture = setup();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[0].click();
    buttons[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toEqual(['two']);
    expect(buttons[2].getAttribute('aria-checked')).toBe('true');
    expect(buttons[1].disabled).toBe(true);
  });
  it('toggles independent choices in multiple mode', () => {
    const fixture = setup(true);
    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[0].click();
    buttons[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toEqual(['one', 'two']);
    buttons[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toEqual(['two']);
    expect(buttons[2].getAttribute('aria-pressed')).toBe('true');
  });
  it('moves selection and focus with arrows, skipping disabled options', () => {
    const fixture = setup();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[0].focus();
    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toEqual(['two']);
    expect(document.activeElement).toBe(buttons[2]);
    buttons[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toEqual(['one']);
  });
  it('disables every button when the group is disabled', () => {
    const fixture = setup();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    for (const button of fixture.nativeElement.querySelectorAll('button'))
      expect(button.disabled).toBe(true);
  });
});

describe('menus', () => {
  function setup() {
    const fixture = TestBed.createComponent(Dropdown);
    fixture.componentRef.setInput('label', 'Actions');
    fixture.componentRef.setInput('options', options);
    fixture.detectChanges();
    return fixture;
  }
  it('opens by keyboard, skips disabled items and restores focus on Escape', async () => {
    const fixture = setup();
    const trigger = fixture.nativeElement.querySelector('button');
    trigger.focus();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve));
    const items = fixture.nativeElement.querySelectorAll('[role="menuitem"]');
    expect(document.activeElement).toBe(items[0]);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    items[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(items[2]);
    items[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
  it('emits a selected value once, closes, and ignores disabled items', () => {
    const fixture = setup();
    const selected = vi.fn();
    fixture.componentInstance.selected.subscribe(selected);
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('[role="menuitem"]');
    items[1].click();
    expect(selected).not.toHaveBeenCalled();
    items[2].click();
    fixture.detectChanges();
    expect(selected).toHaveBeenCalledExactlyOnceWith('two');
    expect(fixture.nativeElement.querySelector('[role="menu"]')).toBeNull();
  });
  it('closes on outside click and on Tab', () => {
    const fixture = setup();
    const trigger = fixture.nativeElement.querySelector('button');
    trigger.click();
    fixture.detectChanges();
    document.body.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).toBeNull();
    trigger.click();
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('[role="menuitem"]')
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).toBeNull();
  });
  it('closes when disabled and stays closed after enabling again', () => {
    const fixture = setup();
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).not.toBeNull();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).toBeNull();
    fixture.componentRef.setInput('disabled', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).toBeNull();
  });
  it('cannot open when disabled', () => {
    const fixture = setup();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).toBeNull();
  });
  it('separates the main action from the option menu', () => {
    const fixture = TestBed.createComponent(OptionButton);
    fixture.componentRef.setInput('label', 'Save');
    fixture.componentRef.setInput('options', options);
    fixture.detectChanges();
    const action = vi.fn();
    fixture.componentInstance.action.subscribe(action);
    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[0].click();
    expect(action).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.querySelector('[role="menu"]')).toBeNull();
    buttons[1].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).not.toBeNull();
    expect(action).toHaveBeenCalledTimes(1);
  });
});
