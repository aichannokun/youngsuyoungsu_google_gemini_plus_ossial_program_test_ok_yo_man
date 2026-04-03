export const metadata = {
  title: '영수증 스캐너',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        {/* 모바일에서 화면 작게 보이는 거 방지하는 마법의 주문 */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body style={{ margin: 0, backgroundColor: 'black' }}>
        {children}
      </body>
    </html>
  );
}
