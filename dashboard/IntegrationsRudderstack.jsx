import React, { useState, useEffect } from "react";
import IntegrationToggleCard from "pages/integrations/components/IntegrationToggleCard";
import ToggleIntegration from "pages/integrations/components/ToggleIntegration";
import EmptyState from "components/lib/EmptyState";
import LeonLoader from "components/lib/LeonLoader";
import PageSubHeaderLink from "components/lib/PageSubHeaderLink";
import Alert from "components/lib/alert";
import Container from "components/lib/container";
import { checkFreshpaintOrSegmentInstall, fetchConfig, markDestAndIsEnabled } from "lib/actions/integrations";
import { IncomingWebhooks } from "pages/integrations/components/IncomingWebhooks";

const IntegrationsRudderstack = () => {
  const [updatingDestEnabled, setUpdatingDestEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({});
  const [isFreshpaintInstall, setIsFreshpaintInstall] = useState(false);
  const [isSegmentInstall, setIsSegmentInstall] = useState(false);

  useEffect(() => {
    fetchRudderstackConfig();
    checkForCDPInstallation();
  }, []);

  const checkForCDPInstallation = async () => {
    const accountConfig = await checkFreshpaintOrSegmentInstall();
    setIsFreshpaintInstall(accountConfig.viaFreshPaint);
    setIsSegmentInstall(accountConfig.viaSegment);
  };

  const onToggleSwitch = () => {
    setUpdatingDestEnabled(true);
    return markDestAndIsEnabled("rudderstack", !config.dest_enabled)
      .then(({ config }) => {
        setConfig(config);
      })
      .finally(() => {
        setUpdatingDestEnabled(false);
      });
  };

  const fetchRudderstackConfig = () => {
    setLoading(true);
    return fetchConfig("rudderstack")
      .then(({ config }) => {
        setConfig(config);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const isConnected = config.dest_enabled && config.is_enabled;

  return (
    <Container>
      <PageSubHeaderLink icon="arrow-left" to="/integrations" className="tw-mb-5">
        Back to Integrations
      </PageSubHeaderLink>
      
      {loading ? (
        <div className="tw-w-full tw-flex tw-justify-center tw-my-6">
          <LeonLoader shouldBlurBackground snapToParent />
        </div>
      ) : (
        <>
          <ToggleIntegration
            integrationId="rudderstack"
            checked={config.dest_enabled && config.is_enabled}
            disabled={loading || updatingDestEnabled}
            onChange={onToggleSwitch}
          />

          {!isConnected ? (
            <div className="tw-mt-5">
              <EmptyState placeholderUid="integration-rudderstack" />
            </div>
          ) : (
            <div className="tw-mt-5">
              {(isFreshpaintInstall || isSegmentInstall) && (
                <Alert useIcon kind="info">
                  {`We've detected you've installed via a CDP (${isFreshpaintInstall ? "Freshpaint" : "Segment"}). Be wary of sending duplicate data.`}
                </Alert>
              )}
              
              <IntegrationToggleCard
                title="Chameleon Data Out"
                subTitle="Use Rudderstack as a data source: send data to Chameleon to get better segmentation and personalize content. Send Chameleon data to Rudderstack as a destination to trigger campaigns and analysis based on what customers are doing in your product."
              />

              <div className="card tw-rounded-lg tw-mt-5 tw-p-5">
                <h3 className="tw-mb-3">Webhooks from Rudderstack</h3>
                <p className="tw-text-slate-500 tw-mb-4">
                  Use the following endpoints to receive data in your Chameleon account from Rudderstack.
                </p>
                <IncomingWebhooks />
                
                <div className="tw-mt-6 tw-p-4 tw-bg-blue-50 tw-rounded-lg">
                  <h4 className="tw-font-semibold tw-text-blue-800 tw-mb-2">Rudderstack Configuration</h4>
                  <p className="tw-text-blue-700 tw-text-sm tw-mb-3">
                    In your Rudderstack dashboard, add Chameleon as a destination and use your account secret as the configuration key.
                  </p>
                  <div className="tw-space-y-2 tw-text-sm tw-text-blue-600">
                    <div>• <strong>Destination:</strong> Chameleon</div>
                    <div>• <strong>Account Secret:</strong> Use the token from the webhook URLs above</div>
                    <div>• <strong>Supported Events:</strong> identify, track, page</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default IntegrationsRudderstack;