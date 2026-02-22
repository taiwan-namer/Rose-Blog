/**
 * 標籤結構，與上方導航選單對應
 */
export const TAG_OPTIONS = [
  {
    group: "DestinyMap",
    options: [{ value: "destiny-map", label: "DestinyMap" }],
  },
  {
    group: "國內旅遊",
    options: [
      { value: "yilan", label: "宜蘭" },
      { value: "taipei", label: "台北" },
      { value: "taoyuan", label: "桃園" },
      { value: "new-taipei", label: "新北" },
      { value: "taichung", label: "台中" },
    ],
  },
  {
    group: "國外旅遊",
    options: [
      { value: "japan", label: "日本" },
      { value: "korea", label: "韓國" },
      { value: "thailand", label: "泰國" },
    ],
  },
  {
    group: "親子生活",
    options: [
      { value: "attractions", label: "親子景點" },
      { value: "restaurants", label: "親子餐廳" },
      { value: "activities", label: "親子活動" },
    ],
  },
  {
    group: "親子課程",
    options: [
      { value: "parenting-course-north", label: "雙北" },
      { value: "parenting-course-taoyuan", label: "桃竹苗" },
      { value: "parenting-course-central", label: "中部" },
      { value: "parenting-course-south", label: "南部" },
    ],
  },
  {
    group: "Rose 的小衣櫃",
    options: [
      { value: "rose-closet-nm", label: "NM" },
      { value: "rose-closet-ll", label: "LL" },
      { value: "rose-closet-wdw", label: "WDW" },
      { value: "rose-closet-er", label: "ER" },
      { value: "rose-closet-tsai", label: "財財的手作基地" },
      { value: "rose-closet-star", label: "小星星" },
    ],
  },
] as const;

export type TagValue = (typeof TAG_OPTIONS)[number]["options"][number]["value"];

export function getTagLabel(value: string): string {
  for (const group of TAG_OPTIONS) {
    const found = group.options.find((o) => o.value === value);
    if (found) return found.label;
  }
  return value;
}
