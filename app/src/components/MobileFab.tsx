import { FloatButton } from "antd";
import { ShoppingOutlined, SkinOutlined } from "@ant-design/icons";
import "./MobileFab.css";

interface MobileFabProps {
  onScrollToCart: () => void;
  onScrollToClothes: () => void;
}

export default function MobileFab({
  onScrollToCart,
  onScrollToClothes,
}: MobileFabProps) {
  return (
    <>
      <FloatButton
        className='mobile-fab mobile-fab--cart'
        icon={<ShoppingOutlined />}
        onClick={onScrollToCart}
        style={{ right: 16, bottom: 70 }}
      />
      <FloatButton
        className='mobile-fab mobile-fab--clothes'
        icon={<SkinOutlined />}
        onClick={onScrollToClothes}
        style={{ right: 16, bottom: 24 }}
      />
    </>
  );
}
