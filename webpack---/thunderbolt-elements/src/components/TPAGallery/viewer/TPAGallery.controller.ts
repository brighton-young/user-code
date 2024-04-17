import {
  IPlatformData,
  withCompController,
} from '@wix/editor-elements-integrations';
import {
  TPAGalleryControllerActions,
  TPAGalleryProps,
} from '../TPAGallery.types';

export const getComponentProps = ({
  mapperProps,
  controllerUtils,
}: IPlatformData<
  Record<string, any>,
  TPAGalleryProps,
  Record<string, any>
>): TPAGalleryControllerActions => {
  return {
    ...mapperProps,
    onCurrentItemChanged: event => {
      controllerUtils.updateProps({
        currentIndex: event.itemIndex,
      });
    },
    onUnMount: () => {
      controllerUtils.updateProps({ componentReady: false });
    },
  };
};

export default withCompController(getComponentProps);
