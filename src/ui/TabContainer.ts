import * as PIXI from 'pixi.js';

import { Style } from './Style';
import { Tab } from './Tab';

interface TabSlot {
  tab: Tab;
  content: PIXI.Container;
}

export class TabContainer extends PIXI.Container {
  #bg: PIXI.NineSlicePlane;
  #tabs: TabSlot[];
  #activeTab: number;

  constructor(width: number, height: number) {
    super();

    this.#bg = Style.createNineSlicePane(Style.textures.button.normal);
    // Make the tab's bottom border overlap the bg's top border
    this.#bg.y = Style.buttonHeight - Style.tabBorder;
    this.#bg.width = width;
    this.#bg.height = height - this.#bg.y;

    this.#tabs = []; // List of { tab, container }
    this.#activeTab = -1; // Index of active tab in #tabs array

    this.addChild(this.#bg);

    // The active tab needs to be drawn last
    this.sortableChildren = true;
  }

  /**
   * Append a tab
   * @param content: PIXI.Container to associate with the tab
   */
  addTab(label: string, content: PIXI.Container): void {
    const tab = new Tab(label);
    const index = this.#tabs.length;
    tab.on('click', () => {
      if (this.#activeTab !== index) {
        const previous = this.#tabs[this.#activeTab];
        previous.tab.unselect();
        this.removeChild(previous.content);

        this.addChild(this.#tabs[index].content);
        this.#activeTab = index;
        this.#tabs[index].tab.select();
      }
    });

    // Place content under the tab row
    content.position.set(Style.tabContentPadding, Style.buttonHeight + Style.tabContentPadding);

    if (this.#tabs.length > 0) {
      // Place new tab after last tab
      const lastTab = this.#tabs[this.#tabs.length - 1].tab;
      tab.position.set(lastTab.x + lastTab.getBaseWidth(), 0);
    } else {
      // Make first tab the active one
      this.#activeTab = 0;
      tab.position.set(Style.tabBorder, 0);
      tab.select();
      this.addChild(content);
    }

    this.#tabs.push({ tab, content });
    this.addChild(tab);
  }

  resize(width: number, height: number): void {
    this.#bg.width = width;
    this.#bg.height = height - this.#bg.y;
  }
}
