import React from 'react';
import RangeLogo from './RangeLogo';

export default function Footer() {
  return (
    <footer className="mt-auto flex-none border-t border-white/10 bg-[#1d1d1f]">
      <div className="px-5 sm:px-8 md:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-[1240px] flex flex-col items-start gap-4 py-8 sm:py-12">
          <RangeLogo className="text-[19px] leading-[26px] font-semibold text-white sm:text-[21px] sm:leading-[28px]" />
          <nav aria-label="Legal links" className="flex flex-wrap gap-x-6 gap-y-2">
            <a href="https://www.range.com/public/security" target="_blank" rel="noreferrer noopener" className="text-[13px] leading-5 text-[#d2d2d7] hover:text-white hover:underline">Security</a>
            <a href="https://www.range.com/public/terms" target="_blank" rel="noreferrer noopener" className="text-[13px] leading-5 text-[#d2d2d7] hover:text-white hover:underline">Terms of Service</a>
            <a href="https://www.range.com/public/advisory-agreement" target="_blank" rel="noreferrer noopener" className="text-[13px] leading-5 text-[#d2d2d7] hover:text-white hover:underline">Advisory Agreement</a>
            <a href="https://www.range.com/public/privacy" target="_blank" rel="noreferrer noopener" className="text-[13px] leading-5 text-[#d2d2d7] hover:text-white hover:underline">Privacy Policy</a>
            <a href="https://www.range.com/compliance/range-advisory-form-adv-part-2a.pdf" target="_blank" rel="noreferrer noopener" className="text-[13px] leading-5 text-[#d2d2d7] hover:text-white hover:underline">Form ADV Part 2A</a>
            <a href="https://www.range.com/public/legal-disclosure" target="_blank" rel="noreferrer noopener" className="text-[13px] leading-5 text-[#d2d2d7] hover:text-white hover:underline">Legal Disclosure</a>
            <a href="https://www.range.com/compliance/range-investing-crs.pdf" target="_blank" rel="noreferrer noopener" className="text-[13px] leading-5 text-[#d2d2d7] hover:text-white hover:underline">Client Relationship Summary</a>
          </nav>
          <button type="button" className="cky-banner-element cursor-pointer text-[12px] leading-4 text-[#86868b] underline hover:text-white">
            Your Privacy Choices
          </button>
          <hr className="w-full border-t border-white/10" />
          <div className="flex w-full max-w-250 flex-col gap-3">
            <p className="text-[12px] leading-4 text-[#86868b]">
              Range Advisory, LLC (&ldquo;Range Advisory&rdquo; or &ldquo;the Firm&rdquo;) is an SEC registered investment adviser. Registration with the SEC should not be construed as an endorsement or an indicator of investment skill, acumen, training, or experience.
            </p>
            <p className="text-[12px] leading-4 text-[#86868b]">
              You may have landed on this page through a paid partnership with a third-party publisher partner. Range compensates affiliate partners for the promotion of Range’s services which may create a conflict of interest. Basic information, including your name, may be shared between Range and third party partners for reporting purposes. Please review Range’s{' '}
              <a href="https://www.range.com/compliance/range-advisory-form-adv-part-2a.pdf" target="_blank" rel="noreferrer noopener" className="underline hover:text-white">Form ADV</a>
              {' '}and{' '}
              <a href="https://www.range.com/compliance/range-investing-crs.pdf" target="_blank" rel="noreferrer noopener" className="underline hover:text-white">Client Relationship Summary</a>
              {' '}for more information.
            </p>
            <p className="text-[12px] leading-4 text-[#86868b]">
              By using this website, you accept and agree to Range Advisory’s{' '}
              <a href="https://www.range.com/public/terms" target="_blank" rel="noreferrer noopener" className="underline hover:text-white">Terms of Service</a>
              {' '}and{' '}
              <a href="https://www.range.com/public/privacy" target="_blank" rel="noreferrer noopener" className="underline hover:text-white">Privacy Policy</a>
              . Range Investing, LLC, a wholly-owned subsidiary of Range Finance, LLC, is a member of the Financial Industry Regulatory Authority (FINRA) and the Securities Investor Protection Corporation (SIPC). You may check the background of our firm and its investment professionals on{' '}
              <a href="https://brokercheck.finra.org/" target="_blank" rel="noreferrer noopener" className="underline hover:text-white">FINRA’s BrokerCheck</a>.
            </p>
            <p className="text-[12px] leading-4 text-[#86868b]">
              Range Advisory has prepared the non-password protected pages of this website (the &ldquo;Website&rdquo;) for the purpose of providing general information regarding its investment advisory services where providing such information is not prohibited by applicable law. The information contained on the Website should not be construed as personalized investment advice and should not be considered as a solicitation to buy or sell any security or engage in a particular investment strategy. Nothing on the Website should be construed as an offer, recommendation, or solicitation to buy or sell any security or a financial product. All statements and opinions included on the Website are intended to be current as of the date of publication but are subject to change without notice. Such statements and opinions do not necessarily represent the views of Range Advisory.
            </p>
            <p className="text-[12px] leading-4 text-[#86868b]">
              Investment management and advisory services are provided by Range Advisory to individuals who have entered into an investment advisory agreement, subject to the terms of such agreement. Please review our current{' '}
              <a href="https://www.range.com/public/advisory-agreement" target="_blank" rel="noreferrer noopener" className="underline hover:text-white">Advisory Agreement</a>
              , for reference. All investing involves risk, including the possible loss of money you invest, and past performance does not guarantee future performance. Past performance is not necessarily indicative of future results and there can be no assurance that any views, outlooks, projections or forward-looking statements will be achieved with respect to any investment or investment strategy. Any projected returns are deemed to be hypothetical and are based on current expectations and assumptions. Due to various risks and uncertainties, actual events, results or performance may differ materially from what is assumed in any forecast.
            </p>
            <p className="text-[12px] leading-4 text-[#86868b]">
              Unless otherwise noted, any statement regarding an individual’s experience with Range Advisory contained herein were made by persons who, as of the date of the statement, were either clients of the Firm (or persons affiliated with clients of the Firm) who did not receive any cash or non-cash compensation or other benefits in relation to such statements. The results and experiences conveyed in such statements may not be representative of all of Range Advisory’s clients or their experiences. Such statements do not guarantee future performance or success.
            </p>
            <p className="text-[12px] leading-4 text-[#86868b]">
              Certified Financial Planner Board of Standards, Inc. (CFP Board) owns the certification marks CFP®, CERTIFIED FINANCIAL PLANNER™, and CFP® (with plaque design) in the United States, which it authorizes use of by individuals who successfully complete CFP Board’s initial and ongoing certification requirements.
            </p>
            <p className="text-[12px] leading-4 text-[#86868b]">
              The information contained in this page is for informational purposes only. This content may not be relied on in any manner as legal, tax, regulatory, or investment advice. Range Advisory, LLC (&ldquo;Range Advisory&rdquo;) does not make any representation or warranty, express or implied, as to the accuracy or completeness of the information contained herein and nothing contained herein should be relied upon as a promise or representation as to past or future events. All figures and allocations shown are for illustrative purposes only and are not recommendations. All investments involve a high degree of risk, including the possible loss of some or all of an investment. Past performance does not guarantee future results.
            </p>
            <p className="text-[12px] leading-4 text-[#86868b]">
              Range Advisory, LLC is an SEC-registered investment adviser. Registration with the SEC does not imply any level of skill or training. Investment advisory services by Range Advisory, LLC. For accounts custodied with Apex Clearing Corporation (&ldquo;Apex&rdquo;), brokerage services are provided by Range Investing, LLC, and clearing and custody services are provided by Apex. For accounts custodied with Altruist Financial LLC (&ldquo;Altruist&rdquo;), brokerage, clearing, and custody services are provided by Altruist. Range Investing, LLC, Apex, and Altruist are each SEC-registered broker-dealers and members of FINRA and SIPC. Range Advisory, LLC pricing and additional information can be found at{' '}
              <a href="https://www.range.com/" target="_blank" rel="noreferrer noopener" className="underline hover:text-white">range.com</a>
              . Please refer to Range’s{' '}
              <a href="https://www.range.com/compliance/range-advisory-form-adv-part-2a.pdf" target="_blank" rel="noreferrer noopener" className="underline hover:text-white">Form ADV Part 2A</a>
              {' '}for additional information about advisory services, fees, and risks.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
