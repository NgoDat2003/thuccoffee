// Cào từ thuccoffee.com.vn ngày 2026-07-24. Snapshot, không phải chân lý.
// 42 sản phẩm: 18 có option, 24 một giá, 47 link.

export const scrapedOptionCatalog = ['Lạnh', 'Nóng', 'Size nhỏ', 'Size vừa'];

export const labelToOption: Record<string, string> = {
  "Nóng": "Nóng",
  "HOT": "Nóng",
  "Nóng (size M)": "Nóng",
  "Nóng (size L)": "Size vừa",
  "Lạnh": "Lạnh",
  "Lạnh (Size M)": "Lạnh",
  "Lạnh (size M)": "Lạnh",
  "Lạnh(Size M)": "Lạnh",
  "Lạnh (size S)": "Size nhỏ",
  "COLD (SIZE S)": "Size nhỏ",
  "SIZE M": "Size nhỏ",
  "Lạnh (Size L)": "Size vừa",
  "Lạnh (size L)": "Size vừa",
  "SIZE L": "Size vừa"
};

export const scrapedProductOptions: Record<string, {
  label: string;
  option: string;
  price: number;
}[]> = {
  "americano-s153t2": [
    {
      "label": "Lạnh (Size M)",
      "option": "Lạnh",
      "price": 45000
    },
    {
      "label": "Lạnh (Size L)",
      "option": "Size vừa",
      "price": 55000
    },
    {
      "label": "Nóng",
      "option": "Nóng",
      "price": 45000
    }
  ],
  "black-coffee-s145t2": [
    {
      "label": "Lạnh (size S)",
      "option": "Size nhỏ",
      "price": 35000
    },
    {
      "label": "Lạnh (size M)",
      "option": "Lạnh",
      "price": 39000
    },
    {
      "label": "Lạnh (size L)",
      "option": "Size vừa",
      "price": 49000
    },
    {
      "label": "Nóng",
      "option": "Nóng",
      "price": 39000
    }
  ],
  "cappuccino-s155t2": [
    {
      "label": "Lạnh (Size M)",
      "option": "Lạnh",
      "price": 50000
    },
    {
      "label": "Lạnh (Size L)",
      "option": "Size vừa",
      "price": 60000
    },
    {
      "label": "Nóng",
      "option": "Nóng",
      "price": 50000
    }
  ],
  "caramel-coffee-jelly-ib-s259t2": [
    {
      "label": "SIZE M",
      "option": "Size nhỏ",
      "price": 55000
    },
    {
      "label": "SIZE L",
      "option": "Size vừa",
      "price": 65000
    }
  ],
  "chocolate-ib-s263t2": [
    {
      "label": "SIZE M",
      "option": "Size nhỏ",
      "price": 55000
    },
    {
      "label": "SIZE L",
      "option": "Size vừa",
      "price": 65000
    }
  ],
  "chocolate-s167t2": [
    {
      "label": "Lạnh (Size M)",
      "option": "Lạnh",
      "price": 55000
    },
    {
      "label": "Lạnh (Size L)",
      "option": "Size vừa",
      "price": 65000
    },
    {
      "label": "HOT",
      "option": "Nóng",
      "price": 55000
    }
  ],
  "cinnamon-tea-s181t2": [
    {
      "label": "COLD (SIZE S)",
      "option": "Size nhỏ",
      "price": 45000
    },
    {
      "label": "HOT",
      "option": "Nóng",
      "price": 45000
    }
  ],
  "egg-coffee-s1243t2": [
    {
      "label": "Lạnh",
      "option": "Lạnh",
      "price": 55000
    },
    {
      "label": "Nóng",
      "option": "Nóng",
      "price": 55000
    }
  ],
  "espresso-s152t2": [
    {
      "label": "Nóng (size M)",
      "option": "Nóng",
      "price": 39000
    },
    {
      "label": "Nóng (size L)",
      "option": "Size vừa",
      "price": 49000
    }
  ],
  "latte-coffee-s157t2": [
    {
      "label": "Lạnh (Size M)",
      "option": "Lạnh",
      "price": 50000
    },
    {
      "label": "Lạnh (Size L)",
      "option": "Size vừa",
      "price": 60000
    },
    {
      "label": "Nóng",
      "option": "Nóng",
      "price": 50000
    }
  ],
  "lemon-black-tea-s177t2": [
    {
      "label": "COLD (SIZE S)",
      "option": "Size nhỏ",
      "price": 45000
    },
    {
      "label": "HOT",
      "option": "Nóng",
      "price": 45000
    }
  ],
  "matcha-ib-s258t2": [
    {
      "label": "SIZE M",
      "option": "Size nhỏ",
      "price": 55000
    },
    {
      "label": "SIZE L",
      "option": "Size vừa",
      "price": 65000
    }
  ],
  "matcha-tea-latte-s169t2": [
    {
      "label": "Lạnh (Size M)",
      "option": "Lạnh",
      "price": 55000
    },
    {
      "label": "Lạnh (Size L)",
      "option": "Size vừa",
      "price": 65000
    },
    {
      "label": "HOT",
      "option": "Nóng",
      "price": 55000
    }
  ],
  "oolong-bubble-milk-tea-s184t2": [
    {
      "label": "Lạnh(Size M)",
      "option": "Lạnh",
      "price": 45000
    },
    {
      "label": "Lạnh (Size L)",
      "option": "Size vừa",
      "price": 55000
    },
    {
      "label": "HOT",
      "option": "Nóng",
      "price": 45000
    }
  ],
  "salted-milkfoam-coffee-s1000t2": [
    {
      "label": "Lạnh (size M)",
      "option": "Lạnh",
      "price": 45000
    },
    {
      "label": "Lạnh (size L)",
      "option": "Size vừa",
      "price": 55000
    }
  ],
  "special-white-coffee-s882t2": [
    {
      "label": "Lạnh (size M)",
      "option": "Lạnh",
      "price": 45000
    },
    {
      "label": "Lạnh (size L)",
      "option": "Size vừa",
      "price": 55000
    },
    {
      "label": "Nóng",
      "option": "Nóng",
      "price": 45000
    }
  ],
  "thuc-milk-tea-s195t2": [
    {
      "label": "SIZE M",
      "option": "Size nhỏ",
      "price": 50000
    },
    {
      "label": "SIZE L",
      "option": "Size vừa",
      "price": 60000
    }
  ],
  "white-coffee-s147t2": [
    {
      "label": "Lạnh (size S)",
      "option": "Size nhỏ",
      "price": 35000
    },
    {
      "label": "Lạnh (size M)",
      "option": "Lạnh",
      "price": 39000
    },
    {
      "label": "Lạnh (size L)",
      "option": "Size vừa",
      "price": 49000
    },
    {
      "label": "Nóng",
      "option": "Nóng",
      "price": 39000
    }
  ]
};
