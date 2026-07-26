// Tính toán Cung Phi Bát Trạch và Ngũ Hành

type Gender = 'nam' | 'nu';

export interface PhongThuyResult {
  namSinh: number;
  gioiTinh: Gender;
  canChi: string;
  nguHanh: string;
  cungPhi: string;
  menhQuai: string;
  huongTot: { ten: string; huong: string; yNghia: string }[];
  huongXau: { ten: string; huong: string; yNghia: string }[];
  mauSac: { tuongSinh: string; tuongHop: string; kiengKy: string };
}

const THIEN_CAN = ["Canh", "Tân", "Nhâm", "Quý", "Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ"];
const DIA_CHI = ["Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi"];

const CAN_VALUE = { "Giáp": 1, "Ất": 1, "Bính": 2, "Đinh": 2, "Mậu": 3, "Kỷ": 3, "Canh": 4, "Tân": 4, "Nhâm": 5, "Quý": 5 };
const CHI_VALUE = { 
  "Tý": 0, "Sửu": 0, "Ngọ": 0, "Mùi": 0, 
  "Dần": 1, "Mão": 1, "Thân": 1, "Dậu": 1, 
  "Thìn": 2, "Tỵ": 2, "Tuất": 2, "Hợi": 2 
};

const NGU_HANH_MAP: Record<number, string> = {
  1: "Kim",
  2: "Thủy",
  3: "Hỏa",
  4: "Thổ",
  5: "Mộc"
};

const CUNG_PHI_MAP = {
  1: "Khảm",
  2: "Khôn",
  3: "Chấn",
  4: "Tốn",
  5: "Trung", // Xử lý đặc biệt
  6: "Càn",
  7: "Đoài",
  8: "Cấn",
  9: "Ly"
};

const DONG_TU_MENH = ["Khảm", "Chấn", "Tốn", "Ly"];
const TAY_TU_MENH = ["Càn", "Khôn", "Cấn", "Đoài"];

// Bảng hướng (Cung Phi -> Hướng)
// Thứ tự 8 hướng: Bắc, Đông Bắc, Đông, Đông Nam, Nam, Tây Nam, Tây, Tây Bắc
const HUONG_BAT_TRACH = {
  "Càn": {
    tot: [
      { ten: "Sinh Khí", huong: "Tây", yNghia: "Thu hút tài lộc, danh tiếng, thăng quan phát tài" },
      { ten: "Thiên Y", huong: "Đông Bắc", yNghia: "Cải thiện sức khỏe, trường thọ" },
      { ten: "Diên Niên", huong: "Tây Nam", yNghia: "Củng cố các mối quan hệ gia đình, tình yêu" },
      { ten: "Phục Vị", huong: "Tây Bắc", yNghia: "Củng cố sức mạnh tinh thần, may mắn trong thi cử" }
    ],
    xau: [
      { ten: "Tuyệt Mệnh", huong: "Nam", yNghia: "Phá sản, bệnh tật chết người" },
      { ten: "Ngũ Quỷ", huong: "Đông", yNghia: "Mất nguồn thu nhập, cãi vã" },
      { ten: "Lục Sát", huong: "Bắc", yNghia: "Xáo trộn quan hệ tình cảm, kiện tụng" },
      { ten: "Họa Hại", huong: "Đông Nam", yNghia: "Không may mắn, thị phi, thất bại" }
    ]
  },
  "Khảm": {
    tot: [
      { ten: "Sinh Khí", huong: "Đông Nam", yNghia: "Thu hút tài lộc, danh tiếng, thăng quan phát tài" },
      { ten: "Thiên Y", huong: "Đông", yNghia: "Cải thiện sức khỏe, trường thọ" },
      { ten: "Diên Niên", huong: "Nam", yNghia: "Củng cố các mối quan hệ gia đình, tình yêu" },
      { ten: "Phục Vị", huong: "Bắc", yNghia: "Củng cố sức mạnh tinh thần, may mắn trong thi cử" }
    ],
    xau: [
      { ten: "Tuyệt Mệnh", huong: "Tây Nam", yNghia: "Phá sản, bệnh tật chết người" },
      { ten: "Ngũ Quỷ", huong: "Đông Bắc", yNghia: "Mất nguồn thu nhập, cãi vã" },
      { ten: "Lục Sát", huong: "Tây Bắc", yNghia: "Xáo trộn quan hệ tình cảm, kiện tụng" },
      { ten: "Họa Hại", huong: "Tây", yNghia: "Không may mắn, thị phi, thất bại" }
    ]
  },
  "Cấn": {
    tot: [
      { ten: "Sinh Khí", huong: "Tây Nam", yNghia: "Thu hút tài lộc, danh tiếng, thăng quan phát tài" },
      { ten: "Thiên Y", huong: "Tây Bắc", yNghia: "Cải thiện sức khỏe, trường thọ" },
      { ten: "Diên Niên", huong: "Tây", yNghia: "Củng cố các mối quan hệ gia đình, tình yêu" },
      { ten: "Phục Vị", huong: "Đông Bắc", yNghia: "Củng cố sức mạnh tinh thần, may mắn trong thi cử" }
    ],
    xau: [
      { ten: "Tuyệt Mệnh", huong: "Đông Nam", yNghia: "Phá sản, bệnh tật chết người" },
      { ten: "Ngũ Quỷ", huong: "Bắc", yNghia: "Mất nguồn thu nhập, cãi vã" },
      { ten: "Lục Sát", huong: "Đông", yNghia: "Xáo trộn quan hệ tình cảm, kiện tụng" },
      { ten: "Họa Hại", huong: "Nam", yNghia: "Không may mắn, thị phi, thất bại" }
    ]
  },
  "Chấn": {
    tot: [
      { ten: "Sinh Khí", huong: "Nam", yNghia: "Thu hút tài lộc, danh tiếng, thăng quan phát tài" },
      { ten: "Thiên Y", huong: "Bắc", yNghia: "Cải thiện sức khỏe, trường thọ" },
      { ten: "Diên Niên", huong: "Đông Nam", yNghia: "Củng cố các mối quan hệ gia đình, tình yêu" },
      { ten: "Phục Vị", huong: "Đông", yNghia: "Củng cố sức mạnh tinh thần, may mắn trong thi cử" }
    ],
    xau: [
      { ten: "Tuyệt Mệnh", huong: "Tây", yNghia: "Phá sản, bệnh tật chết người" },
      { ten: "Ngũ Quỷ", huong: "Tây Bắc", yNghia: "Mất nguồn thu nhập, cãi vã" },
      { ten: "Lục Sát", huong: "Đông Bắc", yNghia: "Xáo trộn quan hệ tình cảm, kiện tụng" },
      { ten: "Họa Hại", huong: "Tây Nam", yNghia: "Không may mắn, thị phi, thất bại" }
    ]
  },
  "Tốn": {
    tot: [
      { ten: "Sinh Khí", huong: "Bắc", yNghia: "Thu hút tài lộc, danh tiếng, thăng quan phát tài" },
      { ten: "Thiên Y", huong: "Nam", yNghia: "Cải thiện sức khỏe, trường thọ" },
      { ten: "Diên Niên", huong: "Đông", yNghia: "Củng cố các mối quan hệ gia đình, tình yêu" },
      { ten: "Phục Vị", huong: "Đông Nam", yNghia: "Củng cố sức mạnh tinh thần, may mắn trong thi cử" }
    ],
    xau: [
      { ten: "Tuyệt Mệnh", huong: "Đông Bắc", yNghia: "Phá sản, bệnh tật chết người" },
      { ten: "Ngũ Quỷ", huong: "Tây Nam", yNghia: "Mất nguồn thu nhập, cãi vã" },
      { ten: "Lục Sát", huong: "Tây", yNghia: "Xáo trộn quan hệ tình cảm, kiện tụng" },
      { ten: "Họa Hại", huong: "Tây Bắc", yNghia: "Không may mắn, thị phi, thất bại" }
    ]
  },
  "Ly": {
    tot: [
      { ten: "Sinh Khí", huong: "Đông", yNghia: "Thu hút tài lộc, danh tiếng, thăng quan phát tài" },
      { ten: "Thiên Y", huong: "Đông Nam", yNghia: "Cải thiện sức khỏe, trường thọ" },
      { ten: "Diên Niên", huong: "Bắc", yNghia: "Củng cố các mối quan hệ gia đình, tình yêu" },
      { ten: "Phục Vị", huong: "Nam", yNghia: "Củng cố sức mạnh tinh thần, may mắn trong thi cử" }
    ],
    xau: [
      { ten: "Tuyệt Mệnh", huong: "Tây Bắc", yNghia: "Phá sản, bệnh tật chết người" },
      { ten: "Ngũ Quỷ", huong: "Tây", yNghia: "Mất nguồn thu nhập, cãi vã" },
      { ten: "Lục Sát", huong: "Tây Nam", yNghia: "Xáo trộn quan hệ tình cảm, kiện tụng" },
      { ten: "Họa Hại", huong: "Đông Bắc", yNghia: "Không may mắn, thị phi, thất bại" }
    ]
  },
  "Khôn": {
    tot: [
      { ten: "Sinh Khí", huong: "Đông Bắc", yNghia: "Thu hút tài lộc, danh tiếng, thăng quan phát tài" },
      { ten: "Thiên Y", huong: "Tây", yNghia: "Cải thiện sức khỏe, trường thọ" },
      { ten: "Diên Niên", huong: "Tây Bắc", yNghia: "Củng cố các mối quan hệ gia đình, tình yêu" },
      { ten: "Phục Vị", huong: "Tây Nam", yNghia: "Củng cố sức mạnh tinh thần, may mắn trong thi cử" }
    ],
    xau: [
      { ten: "Tuyệt Mệnh", huong: "Bắc", yNghia: "Phá sản, bệnh tật chết người" },
      { ten: "Ngũ Quỷ", huong: "Đông Nam", yNghia: "Mất nguồn thu nhập, cãi vã" },
      { ten: "Lục Sát", huong: "Nam", yNghia: "Xáo trộn quan hệ tình cảm, kiện tụng" },
      { ten: "Họa Hại", huong: "Đông", yNghia: "Không may mắn, thị phi, thất bại" }
    ]
  },
  "Đoài": {
    tot: [
      { ten: "Sinh Khí", huong: "Tây Bắc", yNghia: "Thu hút tài lộc, danh tiếng, thăng quan phát tài" },
      { ten: "Thiên Y", huong: "Tây Nam", yNghia: "Cải thiện sức khỏe, trường thọ" },
      { ten: "Diên Niên", huong: "Đông Bắc", yNghia: "Củng cố các mối quan hệ gia đình, tình yêu" },
      { ten: "Phục Vị", huong: "Tây", yNghia: "Củng cố sức mạnh tinh thần, may mắn trong thi cử" }
    ],
    xau: [
      { ten: "Tuyệt Mệnh", huong: "Đông", yNghia: "Phá sản, bệnh tật chết người" },
      { ten: "Ngũ Quỷ", huong: "Nam", yNghia: "Mất nguồn thu nhập, cãi vã" },
      { ten: "Lục Sát", huong: "Đông Nam", yNghia: "Xáo trộn quan hệ tình cảm, kiện tụng" },
      { ten: "Họa Hại", huong: "Bắc", yNghia: "Không may mắn, thị phi, thất bại" }
    ]
  }
};

const MAU_SAC = {
  "Kim": { tuongSinh: "Vàng, Nâu đất", tuongHop: "Trắng, Xám, Ghi", kiengKy: "Đỏ, Hồng, Tím" },
  "Thủy": { tuongSinh: "Trắng, Xám, Ghi", tuongHop: "Đen, Xanh dương", kiengKy: "Vàng, Nâu đất" },
  "Mộc": { tuongSinh: "Đen, Xanh dương", tuongHop: "Xanh lá cây", kiengKy: "Trắng, Xám, Ghi" },
  "Hỏa": { tuongSinh: "Xanh lá cây", tuongHop: "Đỏ, Hồng, Tím", kiengKy: "Đen, Xanh dương" },
  "Thổ": { tuongSinh: "Đỏ, Hồng, Tím", tuongHop: "Vàng, Nâu đất", kiengKy: "Xanh lá cây" }
};

export function tinhPhongThuy(namSinh: number, gioiTinh: Gender): PhongThuyResult {
  // 1. Tính Thiên Can Địa Chi
  const can = THIEN_CAN[namSinh % 10];
  const chi = DIA_CHI[namSinh % 12];
  const canChi = `${can} ${chi}`;

  // 2. Tính Ngũ Hành Bản Mệnh
  const valCan = CAN_VALUE[can as keyof typeof CAN_VALUE];
  const valChi = CHI_VALUE[chi as keyof typeof CHI_VALUE];
  let valMenh = valCan + valChi;
  if (valMenh > 5) valMenh -= 5;
  const nguHanh = NGU_HANH_MAP[valMenh];

  // 3. Tính Cung Phi Bát Trạch (Dùng công thức tổng 4 chữ số)
  let sum = namSinh;
  while (sum > 9) {
    sum = String(sum).split('').reduce((a, b) => a + parseInt(b), 0);
  }
  const sumFinal = sum;
  
  let quaSo = 0;
  if (gioiTinh === 'nam') {
    quaSo = 11 - sumFinal;
  } else {
    quaSo = 4 + sumFinal;
  }
  
  // Rút gọn quaSo về 1 chữ số (nếu >= 10 thì trừ 9, tương đương cộng các chữ số lại)
  if (quaSo >= 10) quaSo -= 9;

  let cungPhi = CUNG_PHI_MAP[quaSo as keyof typeof CUNG_PHI_MAP];
  if (cungPhi === "Trung" || quaSo === 5) {
    cungPhi = gioiTinh === 'nam' ? "Khôn" : "Cấn";
  }

  const menhQuai = DONG_TU_MENH.includes(cungPhi) ? "Đông Tứ Mệnh" : "Tây Tứ Mệnh";
  const huong = HUONG_BAT_TRACH[cungPhi as keyof typeof HUONG_BAT_TRACH];
  const mauSac = MAU_SAC[nguHanh as keyof typeof MAU_SAC];

  return {
    namSinh,
    gioiTinh,
    canChi,
    nguHanh,
    cungPhi,
    menhQuai,
    huongTot: huong.tot,
    huongXau: huong.xau,
    mauSac
  };
}
