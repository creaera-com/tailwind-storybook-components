import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
@Component({
  selector: 'ui-root',
  template: '<p>Run npm run storybook to explore the component library.</p>',
})
class StorybookHost {}
bootstrapApplication(StorybookHost).catch(console.error);
