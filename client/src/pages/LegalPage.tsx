/**
 * LegalPage — 通用法律文档页面
 * 支持 Privacy Policy / Terms of Use / Risk Disclosure 三种类型
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Globe } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

// ─── 类型 ─────────────────────────────────────────────────────────────────────

type LegalType = "privacy" | "terms" | "risk-disclosure";

// ─── 内容组件 ─────────────────────────────────────────────────────────────────

function H1({ children }: { children: React.ReactNode }) {
  return <h1 className="text-3xl font-bold text-slate-900 mb-2 leading-tight">{children}</h1>;
}
function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold text-slate-800 mb-3 mt-8">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-600 leading-relaxed mb-3 text-sm">{children}</p>;
}
function UL({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc list-inside space-y-1.5 mb-4 text-sm text-slate-600">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}
function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 mb-6">
      {children}
    </div>
  );
}
function Divider() {
  return <hr className="border-slate-100 my-6" />;
}

// ─── Privacy Policy 内容 ──────────────────────────────────────────────────────

function PrivacyContent({ zh }: { zh: boolean }) {
  return (
    <div>
      <H1>{zh ? "隐私政策" : "Privacy Policy"}</H1>
      <p className="text-sm text-slate-400 mb-6">{zh ? "最后更新日期：2026 年 3 月" : "Last Updated: March 2026"}</p>
      <P>
        {zh
          ? "欢迎使用 RWAlpha.ai（由 DMZ 孵化）。本隐私政策旨在阐明当您访问我们的平台、连接 Web3 钱包以及使用我们提供的 AI 优化的真实世界资产（RWA）收益产品时，我们如何收集、使用、存储和保护您的个人信息与链上数据。"
          : "Welcome to RWAlpha.ai (incubated by DMZ). This Privacy Policy explains how we collect, use, store, and protect your personal information and on-chain data when you access our platform, connect a Web3 wallet, and use our AI-optimized Real World Asset (RWA) yield products."}
      </P>
      <P>
        {zh
          ? "我们在迪拜（DIFC）和开曼群岛双重合规伞型基金架构的监管下运作，并致力于最高标准的数据隐私保护。"
          : "We operate under the regulatory oversight of our dual-compliance umbrella fund structure in Dubai (DIFC) and the Cayman Islands, and are committed to the highest standards of data privacy protection."}
      </P>

      <Divider />

      <H2>{zh ? "1. 我们收集的信息类型" : "1. Types of Information We Collect"}</H2>
      <p className="text-base font-semibold text-slate-700 mb-2 mt-4">{zh ? "链上公开数据" : "On-Chain Public Data"}</p>
      <P>
        {zh
          ? "当您与我们的双保险库协议智能合约交互时，我们会自动收集区块链上的公开可见数据，包括但不限于您的加密钱包地址、智能合约交易记录、投入的 USDT/USDC 金额以及收益分配的哈希记录。"
          : "When you interact with our Dual Vault Protocol smart contracts, we automatically collect publicly visible on-chain data, including but not limited to your crypto wallet address, smart contract transaction records, deposited USDT/USDC amounts, and yield distribution hash records."}
      </P>
      <p className="text-base font-semibold text-slate-700 mb-2 mt-4">{zh ? "合规与身份验证数据（KYC/AML）" : "Compliance & Identity Verification Data (KYC/AML)"}</p>
      <P>
        {zh
          ? "鉴于传统金融合规要求，非美国用户及特定司法管辖区的用户可能面临 KYC 和 AML 流程。在此过程中，我们或授权的第三方合规服务商可能会收集您的身份证明文件、国籍、居住地信息及资金来源声明。"
          : "Due to traditional financial compliance requirements, non-US users and users in certain jurisdictions may undergo KYC and AML processes. During this process, we or authorized third-party compliance service providers may collect your identity documents, nationality, residence information, and source of funds declarations."}
      </P>
      <p className="text-base font-semibold text-slate-700 mb-2 mt-4">{zh ? "平台使用数据" : "Platform Usage Data"}</p>
      <P>
        {zh
          ? "您访问 RWAlpha 平台时的设备信息、IP 地址、浏览器类型及访问时间等基础交互数据。"
          : "Basic interaction data when you access the RWAlpha platform, including device information, IP address, browser type, and access time."}
      </P>

      <Divider />

      <H2>{zh ? "2. 我们如何使用您的信息" : "2. How We Use Your Information"}</H2>
      <UL items={[
        zh ? "服务执行与结算：用于执行 AI 引擎的自动再平衡指令，并确保每周以 USDT 形式结算的收益准确发送至您的钱包。" : "Service Execution & Settlement: To execute AI engine auto-rebalancing instructions and ensure weekly USDT yield settlements are accurately sent to your wallet.",
        zh ? "合规与风控：用于核实您的资格，确保服务不被滥用，并符合迪拜与开曼双伞型基金架构的合规及审计要求。" : "Compliance & Risk Control: To verify your eligibility, prevent service abuse, and comply with the compliance and audit requirements of our Dubai-Cayman dual-structure fund.",
      ]} />

      <Divider />

      <H2>{zh ? "3. 我们如何共享您的信息" : "3. How We Share Your Information"}</H2>
      <UL items={[
        zh ? "基金管理人与托管方：包括迪拜 QCD Open-end PCC 基金的管理人卡塔尔国家银行（QNB）、资产托管方渣打银行（Standard Chartered Bank），以及开曼 RWAlpha Matrix SPC 架构下的 BVI 基金管理人。" : "Fund Managers & Custodians: Including QNB (fund manager of Dubai QCD Open-end PCC), Standard Chartered Bank (asset custodian), and the BVI fund manager under Cayman RWAlpha Matrix SPC.",
        zh ? "支付与资金路由通道：OTC、DMZ Finance、中金公司（CICC）以及对接底层资产的传统券商，以完成 USDT/USDC 与法币的兑换及底层 ETF 的配置。" : "Payment & Fund Routing Channels: OTC, DMZ Finance, CICC, and traditional brokers for underlying asset access, to complete USDT/USDC-fiat conversion and underlying ETF allocation.",
        zh ? "监管机构要求：在适用法律或政府监管机构的强制要求下，我们可能需要披露您的相关信息。" : "Regulatory Requirements: Under applicable laws or mandatory requirements from government regulators, we may need to disclose your relevant information.",
      ]} />

      <Divider />

      <H2>{zh ? "4. 数据安全与去中心化考量" : "4. Data Security & Decentralization Considerations"}</H2>
      <P>
        {zh
          ? "我们在链下处理的任何个人身份数据均采用行业标准的加密技术进行安全存储，并严格限制内部人员及未授权第三方的访问。"
          : "Any personally identifiable data we process off-chain is securely stored using industry-standard encryption, with strict access controls for internal personnel and unauthorized third parties."}
      </P>
      <Callout>
        {zh
          ? "请注意，您在 RWAlpha 上的交易数据（如智能合约交互）会永久记录在公共区块链上。这是区块链技术的固有属性，我们无法修改或删除这些公开的链上数据。"
          : "Please note that your transaction data on RWAlpha (such as smart contract interactions) is permanently recorded on the public blockchain. This is an inherent property of blockchain technology, and we cannot modify or delete this public on-chain data."}
      </Callout>

      <H2>{zh ? "5. 司法管辖与数据跨境传输" : "5. Jurisdiction & Cross-Border Data Transfer"}</H2>
      <P>
        {zh
          ? "RWAlpha 的核心团队分布在新加坡、香港和迪拜。您的信息可能会在这些地区之间，或向我们的合作伙伴（如开曼群岛的实体）进行跨境传输与处理。使用我们的服务即表示您同意此类基于全球合规基础设施的数据传输。"
          : "RWAlpha's core team is distributed across Singapore, Hong Kong, and Dubai. Your information may be transferred and processed across these regions, or to our partners (such as Cayman Islands entities). By using our services, you consent to such data transfers based on our global compliance infrastructure."}
      </P>

      <H2>{zh ? "6. 您的权利与联系方式" : "6. Your Rights & Contact"}</H2>
      <P>
        {zh
          ? "根据适用的数据保护法，您可能有权访问、更正或请求删除我们持有的您的链下个人信息。如有疑问，请通过 privacy@rwalpha.ai 联系我们的合规团队。"
          : "Under applicable data protection laws, you may have the right to access, correct, or request deletion of your off-chain personal information we hold. For questions, please contact our compliance team at privacy@rwalpha.ai."}
      </P>
    </div>
  );
}

// ─── Terms of Service 内容 ────────────────────────────────────────────────────

function TermsContent({ zh }: { zh: boolean }) {
  return (
    <div>
      <H1>{zh ? "服务条款" : "Terms of Service"}</H1>
      <p className="text-sm text-slate-400 mb-6">{zh ? "最后更新日期：2026 年 3 月" : "Last Updated: March 2026"}</p>
      <P>
        {zh
          ? "欢迎访问并使用 RWAlpha.ai。RWAlpha 是一个由 DMZ 孵化的、致力于通过 AI 技术优化真实世界资产（RWA）收益的协议。在您连接 Web3 钱包、访问本网站或与我们的智能合约交互之前，请务必仔细阅读本服务条款。使用我们的服务即表示您完全理解并同意接受以下条款的约束。"
          : "Welcome to RWAlpha.ai. RWAlpha is a protocol incubated by DMZ, dedicated to optimizing Real World Asset (RWA) yields through AI technology. Before connecting your Web3 wallet, accessing this website, or interacting with our smart contracts, please carefully read these Terms of Service. Using our services indicates that you fully understand and agree to be bound by the following terms."}
      </P>

      <Divider />

      <H2>{zh ? "1. 服务说明" : "1. Service Description"}</H2>
      <P>
        {zh
          ? "RWAlpha 提供基于创新「双保险库协议（Dual Vault Protocol）」的代币化收益策略服务。通过分离本金增长与收益分配，我们将传统金融市场的优质收益策略转化为链上产品。"
          : "RWAlpha provides tokenized yield strategy services based on the innovative 'Dual Vault Protocol'. By separating principal growth from yield distribution, we transform premium yield strategies from traditional financial markets into on-chain products."}
      </P>
      <UL items={[
        zh ? "产品矩阵：用户可以通过存入 USDT 或 USDC，选择参与挂钩纳指100（rNDX）、标普500（rSPX）或实物黄金（rGLD）的生息产品。" : "Product Matrix: Users can deposit USDT or USDC to participate in yield products pegged to Nasdaq 100 (rNDX), S&P 500 (rSPX), or physical Gold (rGLD).",
        zh ? "收益结算：依托 AI 引擎驱动的期权收益策略，协议将每周以 USDT 的形式向用户的链上钱包分配并结算收益。" : "Yield Settlement: Powered by AI engine-driven options yield strategies, the protocol distributes and settles yields weekly as USDT to users' on-chain wallets.",
      ]} />

      <Divider />

      <H2>{zh ? "2. 用户资格与合规要求（KYC / AML）" : "2. User Eligibility & Compliance Requirements (KYC / AML)"}</H2>
      <UL items={[
        zh ? "身份认证：参与 RWAlpha 的生息产品可能需要您配合完成 KYC 与 AML 验证流程。部分高级别或机构级的收益策略可能仅向合格投资者（Accredited Investors）开放。" : "Identity Verification: Participating in RWAlpha yield products may require you to complete KYC and AML verification. Certain advanced or institutional-level yield strategies may only be available to Accredited Investors.",
        zh ? "司法管辖区限制：RWAlpha 保留对特定国家、地区（或受国际制裁地区）用户限制访问或拒绝提供服务的权利。" : "Jurisdictional Restrictions: RWAlpha reserves the right to restrict access or refuse service to users from certain countries, regions, or internationally sanctioned areas.",
      ]} />

      <Divider />

      <H2>{zh ? "3. 资金流转与第三方依赖" : "3. Fund Flow & Third-Party Dependencies"}</H2>
      <P>
        {zh
          ? "RWAlpha 致力于打造透明的信任框架，但协议的完整运行高度依赖于外部传统金融基础设施："
          : "RWAlpha is committed to building a transparent trust framework, but the protocol's full operation is highly dependent on external traditional financial infrastructure:"}
      </P>
      <UL items={[
        zh ? "资金路由：您明确知悉并同意，您存入的加密资产（USDT/USDC）以及后续的收益派发，将通过我们的合作伙伴（包括 OTC、DMZ Finance、中金公司 CICC 及传统券商）进行流转与法币兑换。" : "Fund Routing: You explicitly acknowledge and agree that your deposited crypto assets (USDT/USDC) and subsequent yield distributions will be processed through our partners (including OTC, DMZ Finance, CICC, and traditional brokers) for conversion.",
        zh ? "资金链路：投资与收益结算均遵循「资产 ↔ 券商 ↔ OTC ↔ RWAlpha ↔ 用户钱包」的既定通道。我们不对第三方机构的系统延迟或单方面合规冻结承担直接责任。" : "Fund Channel: Investment and yield settlement follow the established channel 'Asset ↔ Broker ↔ OTC ↔ RWAlpha ↔ User Wallet'. We are not directly liable for system delays or unilateral compliance freezes by third-party institutions.",
      ]} />

      <Divider />

      <H2>{zh ? "4. AI 策略的动态调整" : "4. Dynamic AI Strategy Adjustments"}</H2>
      <P>
        {zh
          ? "RWAlpha 的核心优势在于其 AI 引擎。您理解并同意：AI 引擎会实时接收市场数据，并自动执行波动性分析、期权策略优化及投资组合优化。协议会根据市场状况进行自动再平衡，因此具体的期权操作细节、持仓比例以及预期的收益率将由算法动态决定，协议保留在不事先通知的情况下调整策略参数的权利。"
          : "RWAlpha's core advantage lies in its AI Engine. You understand and agree that: the AI Engine receives market data in real-time and automatically executes volatility analysis, options strategy optimization, and portfolio optimization. The protocol will auto-rebalance based on market conditions, so specific options operation details, position ratios, and expected yield rates are dynamically determined by the algorithm. The protocol reserves the right to adjust strategy parameters without prior notice."}
      </P>

      <Divider />

      <H2>{zh ? "5. 责任限制与修改权" : "5. Limitation of Liability & Right to Modify"}</H2>
      <UL items={[
        zh ? "免责声明接入：使用本服务同时受我们的《免责声明》约束，我们不对传统市场的波动及智能合约的不可抗力风险提供绝对的保本或保息承诺。" : "Disclaimer Integration: Use of this service is also subject to our Risk Disclosure. We do not provide absolute guarantees of principal protection or fixed returns against traditional market volatility and smart contract force majeure risks.",
        zh ? "条款修改：RWAlpha 保留随时修改、更新或终止本服务条款的权利。所有的修改将在发布于本页面时即刻生效。" : "Terms Modification: RWAlpha reserves the right to modify, update, or terminate these Terms of Service at any time. All modifications take effect immediately upon publication on this page.",
      ]} />
    </div>
  );
}

// ─── Risk Disclosure 内容 ─────────────────────────────────────────────────────

function RiskContent({ zh }: { zh: boolean }) {
  return (
    <div>
      <H1>{zh ? "风险披露与免责声明" : "Risk Disclosure & Disclaimer"}</H1>
      <p className="text-sm text-slate-400 mb-6">{zh ? "最后更新日期：2026 年 3 月" : "Last Updated: March 2026"}</p>
      <Callout>
        {zh
          ? "参与去中心化金融（DeFi）与真实世界资产（RWA）投资具有固有风险。在使用 RWAlpha.ai 协议及其相关产品前，请仔细阅读并充分理解以下风险披露与免责条款。"
          : "Participating in decentralized finance (DeFi) and Real World Asset (RWA) investments carries inherent risks. Before using the RWAlpha.ai protocol and its related products, please carefully read and fully understand the following risk disclosures and disclaimers."}
      </Callout>

      <Divider />

      <H2>{zh ? "1. 收益非保证与市场风险" : "1. No Guarantee of Returns & Market Risk"}</H2>
      <P>
        {zh
          ? "RWAlpha 提供的是由 AI 优化的收益协议。尽管我们的 AI 引擎会执行波动性分析、期权策略优化和自动再平衡，但这些算法与模型不构成对未来固定回报或不损失本金的任何绝对保证。"
          : "RWAlpha provides AI-optimized yield protocols. Although our AI Engine executes volatility analysis, options strategy optimization, and auto-rebalancing, these algorithms and models do not constitute any absolute guarantee of fixed future returns or principal protection."}
      </P>
      <P>
        {zh
          ? "本金保险库所持有的底层 ETF 资产会追踪指数的资产净值（NAV），因此您的投资直接受传统金融市场（如纳斯达克、标普 500 和实物黄金）波动的影响，可能导致您投入的本金发生亏损。"
          : "The underlying ETF assets held in the Principal Vault track the index's Net Asset Value (NAV), so your investment is directly subject to traditional financial market fluctuations (such as Nasdaq, S&P 500, and physical gold), which may result in losses to your invested principal."}
      </P>

      <Divider />

      <H2>{zh ? "2. 传统金融与第三方基础设施风险" : "2. Third-Party & TradFi Infrastructure Risk"}</H2>
      <P>
        {zh
          ? "RWAlpha 的资金流转和收益结算高度依赖于第三方传统金融机构和支付网关建立的信任框架。用户的资金（USDT/USDC）和底层资产收益需要经过 OTC、传统券商以及我们的合作伙伴（如 DMZ Finance、OTC、中金公司 CICC）进行法币兑换与流转。"
          : "RWAlpha's fund flows and yield settlements are highly dependent on the trust framework established by third-party traditional financial institutions and payment gateways. Users' funds (USDT/USDC) and underlying asset yields need to be processed through OTC, traditional brokers, and our partners (such as DMZ Finance, OTC, CICC) for fiat conversion and transfer."}
      </P>
      <P>
        {zh
          ? "如果上述任何第三方机构出现操作故障、破产、流动性危机或合规冻结，可能会导致您的资产价值受损或链上结算延迟。"
          : "If any of the above third-party institutions experience operational failures, bankruptcy, liquidity crises, or compliance freezes, it may result in impairment of your asset value or delays in on-chain settlement."}
      </P>

      <Divider />

      <H2>{zh ? "3. 智能合约与技术风险" : "3. Smart Contract & Technology Risk"}</H2>
      <P>
        {zh
          ? "RWAlpha 的核心创新在于分离本金与收益的「双保险库协议」。尽管协议代码在上线前会经过严格的测试与第三方安全审计，但区块链技术和智能合约本身依然存在遭受黑客攻击、代码漏洞或底层网络故障的风险。"
          : "RWAlpha's core innovation is the 'Dual Vault Protocol' that separates principal and yield. Although the protocol code undergoes rigorous testing and third-party security audits before launch, blockchain technology and smart contracts still carry risks of hacker attacks, code vulnerabilities, or underlying network failures."}
      </P>
      <P>
        {zh
          ? "由此引发的加密资产损失，RWAlpha 协议及背后的孵化团队不承担直接的法定赔偿责任。"
          : "For crypto asset losses caused thereby, the RWAlpha protocol and its incubating team do not bear direct statutory compensation liability."}
      </P>

      <Divider />

      <H2>{zh ? "4. 监管与跨国合规架构风险" : "4. Regulatory & Compliance Risk"}</H2>
      <P>
        {zh
          ? "RWAlpha 依托底层的 DMZ 基础设施，在迪拜建立了由卡塔尔国家银行（QNB）担任基金管理人、渣打银行担任托管方的首个代币化基金架构（QCD Open-end PCC），并在开曼建立了具备基金会结构的合规架构（RWAlpha Matrix SPC）。"
          : "RWAlpha relies on the underlying DMZ infrastructure, having established in Dubai the first tokenized fund structure (QCD Open-end PCC) with QNB as fund manager and Standard Chartered Bank as custodian, and in the Cayman Islands a compliance structure with foundation structure (RWAlpha Matrix SPC)."}
      </P>
      <P>
        {zh
          ? "尽管目前具备极其完备的双重合规基金结构，但全球对加密资产和 RWA 的监管法律正处于快速演变中。未来监管政策的突变可能会影响协议的合法运作，甚至导致特定司法管辖区的服务被调整、暂停或强制清算。"
          : "Despite the extremely comprehensive dual compliance fund structure currently in place, global regulatory laws for crypto assets and RWA are rapidly evolving. Future sudden changes in regulatory policies may affect the protocol's legal operation, or even lead to service adjustments, suspensions, or forced liquidations in specific jurisdictions."}
      </P>
    </div>
  );
}

// ─── 主页面 ──────────────────────────────────────────────────────────────────

interface LegalPageProps {
  type: LegalType;
}

export default function LegalPage({ type }: LegalPageProps) {
  const getLang = () => localStorage.getItem("rwa-lang") === "en" ? "en" : "zh";
  const [lang, setLang] = useState<"zh" | "en">(getLang);
  const zh = lang === "zh";

  const toggleLang = () => {
    const next = zh ? "en" : "zh";
    setLang(next);
    localStorage.setItem("rwa-lang", next);
  };

  const titles: Record<LegalType, { zh: string; en: string }> = {
    privacy: { zh: "隐私政策", en: "Privacy Policy" },
    terms: { zh: "服务条款", en: "Terms of Service" },
    "risk-disclosure": { zh: "风险披露与免责声明", en: "Risk Disclosure" },
  };

  const links: { href: string; zh: string; en: string }[] = [
    { href: "/privacy", zh: "隐私政策", en: "Privacy Policy" },
    { href: "/terms", zh: "服务条款", en: "Terms of Service" },
    { href: "/risk-disclosure", zh: "风险披露", en: "Risk Disclosure" },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavBar />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={15} />
            {zh ? "返回首页" : "Back to Home"}
          </Link>
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 border border-slate-200 rounded-md px-2.5 py-1.5 transition-colors"
          >
            <Globe size={11} />
            {zh ? "EN" : "中文"}
          </button>
        </div>

        {/* 面包屑 */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-8">
          <Link href="/" className="hover:text-slate-600 transition-colors">RWAlpha</Link>
          <span>/</span>
          <span className="text-slate-600">{zh ? titles[type].zh : titles[type].en}</span>
        </div>

        {/* 主内容 */}
        <div className="prose-sm max-w-none">
          {type === "privacy" && <PrivacyContent zh={zh} />}
          {type === "terms" && <TermsContent zh={zh} />}
          {type === "risk-disclosure" && <RiskContent zh={zh} />}
        </div>

        {/* 底部法律链接 */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {zh ? "© 2026 RWAlpha. 保留所有权利。" : "© 2026 RWAlpha. All rights reserved."}
          </div>
          <div className="flex gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs transition-colors ${
                  (type === "privacy" && link.href === "/privacy") ||
                  (type === "terms" && link.href === "/terms") ||
                  (type === "risk-disclosure" && link.href === "/risk-disclosure")
                    ? "text-indigo-600 font-semibold"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {zh ? link.zh : link.en}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
