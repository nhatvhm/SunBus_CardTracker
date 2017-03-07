import { MyFirstAngular2ProjectPage } from './app.po';

describe('my-first-angular2-project App', () => {
  let page: MyFirstAngular2ProjectPage;

  beforeEach(() => {
    page = new MyFirstAngular2ProjectPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
