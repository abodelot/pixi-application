import * as PIXI from 'pixi.js';

import { Style } from './Style';
import { Tab } from './Tab';

export class TabContainer extends PIXI.Container {
  #bg;
  #tabs;
  #activeTab;

  constructor(width, height) {
    super();

    this.#bg = Style.createNineSlicePane(Style.textures.tab.panel);
    // Make the tab's bottom border overlap the bg's top border
    this.#bg.y = Style.buttonHeight - Style.nineBoxBorder;
    this.#bg.width = width;
    this.#bg.height = height - this.#bg.y;

    this.#tabs = []; // List of { tab, container }
    this.#activeTab = -1; // Index of active tab in #tabs array

    this.addChild(this.#bg);
  }

  /**
   * Append a tab
   * @param content: PIXI.Container to associate with the tab
   */
  addTab(label, content) {
    const tab = new Tab(label);
    const index = this.#tabs.length;
    tab.click = () => {
      if (this.#activeTab !== index) {
        const previous = this.#tabs[this.#activeTab];
        previous.tab.release();
        this.removeChild(previous.content);

        this.addChild(this.#tabs[index].content);
        this.#activeTab = index;
        this.#tabs[index].tab.press();
      }
    };

    // Place content under the tab row
    content.y = Style.buttonHeight;

    if (this.#tabs.length > 0) {
      // Place new tab after last tab
      const lastTab = this.#tabs[this.#tabs.length - 1].tab;
      tab.x = lastTab.x + lastTab.width;
    } else {
      // Make first tab the active one
      this.#activeTab = 0;
      tab.press();
      this.addChild(content);
    }

    this.#tabs.push({ tab, content });
    this.addChild(tab);
  }

  resize(width, height) {
    this.#bg.width = width;
    this.#bg.height = height - this.#bg.y;
  }
}
