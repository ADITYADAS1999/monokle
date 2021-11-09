import {useState} from 'react';
import {MinusSquareOutlined} from '@ant-design/icons';
import {SectionCustomComponent, SectionInstance} from '@models/navigator';
import * as S from './styled';

interface SectionHeaderProps {
  name: string;
  sectionInstance: SectionInstance;
  isSectionSelected: boolean;
  isCollapsed: boolean;
  isSectionHighlighted: boolean;
  isLastSection: boolean;
  hasChildSections: boolean;
  isSectionInitialized: boolean;
  isSectionVisible: boolean;
  isCollapsedMode: 'collapsed' | 'expanded' | 'mixed';
  level: number;
  itemsLength: number;
  expandSection: () => void;
  collapseSection: () => void;
  CustomNameDisplay?: SectionCustomComponent;
  disableHoverStyle: boolean;
}

function SectionHeader(props: SectionHeaderProps) {
  const {
    name,
    sectionInstance,
    isSectionSelected,
    isCollapsed,
    isSectionHighlighted,
    isLastSection,
    hasChildSections,
    isSectionInitialized,
    isSectionVisible,
    isCollapsedMode,
    level,
    itemsLength,
    expandSection,
    collapseSection,
    CustomNameDisplay,
    disableHoverStyle,
  } = props;
  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <S.NameContainer
      isHovered={isHovered}
      isSelected={isSectionSelected && isCollapsed}
      isHighlighted={isSectionHighlighted && isCollapsed}
      isLastSection={isLastSection}
      hasChildSections={hasChildSections}
      isCollapsed={isCollapsed}
      isInitialized={isSectionInitialized}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      isVisible={isSectionVisible}
      disableHoverStyle={disableHoverStyle}
    >
      {CustomNameDisplay ? (
        <CustomNameDisplay sectionInstance={sectionInstance} />
      ) : (
        <>
          <S.Name
            isSelected={isSectionSelected && isCollapsed}
            isHighlighted={isSectionSelected && isCollapsed}
            level={level}
          >
            {name}
            {itemsLength > 0 && <S.ItemsLength>{itemsLength}</S.ItemsLength>}
          </S.Name>
          {isHovered && isSectionInitialized && (
            <S.Collapsible>
              {(isCollapsedMode === 'collapsed' || isCollapsedMode === 'mixed') && (
                <S.PlusSquareOutlined isSelected={isSectionSelected} onClick={expandSection} />
              )}
              {(isCollapsedMode === 'expanded' || isCollapsedMode === 'mixed') && (
                <MinusSquareOutlined onClick={collapseSection} style={{marginLeft: '5px'}} />
              )}
            </S.Collapsible>
          )}
        </>
      )}
    </S.NameContainer>
  );
}

export default SectionHeader;