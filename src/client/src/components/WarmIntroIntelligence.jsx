import React, { useState, useEffect } from 'react';
import { Card, Alert, Button, List, Tag, Divider, Statistic, Row, Col, Spin, Typography, Badge } from 'antd';
import { UserOutlined, LinkOutlined, ClockCircleOutlined, ThunderboltOutlined, MessageOutlined, StarFilled } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const WarmIntroIntelligence = ({ userId = 'mattedwards' }) => {
  const [loading, setLoading] = useState(true);
  const [warmIntros, setWarmIntros] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWarmIntroData();
  }, [userId]);

  const fetchWarmIntroData = async () => {
    try {
      setLoading(true);
      
      // Fetch warm introduction pathways
      const introsResponse = await fetch('/api/relationships/warm-intros-demo?limit=10');
      const introsData = await introsResponse.json();
      
      if (introsData.success) {
        setWarmIntros(introsData.data);
      }

      // Fetch relationship stats
      const statsResponse = await fetch('/api/relationships/stats');
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setStats(statsData.data);
      }

    } catch (err) {
      console.error('Error fetching warm intro data:', err);
      setError('Failed to load relationship intelligence data');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: '#ff4d4f',
      high: '#fa8c16', 
      medium: '#1890ff',
      low: '#52c41a'
    };
    return colors[priority] || '#d9d9d9';
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'urgent') return <ThunderboltOutlined style={{color: '#ff4d4f'}} />;
    if (priority === 'high') return <StarFilled style={{color: '#fa8c16'}} />;
    return <ClockCircleOutlined style={{color: '#1890ff'}} />;
  };

  const formatConfidenceScore = (score) => {
    return `${Math.round(score * 100)}%`;
  };

  const renderWarmIntroCard = (intro) => (
    <Card 
      key={intro.connectionId}
      size="small" 
      className="mb-3"
      style={{borderLeft: `4px solid ${getPriorityColor(intro.priority)}`}}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getPriorityIcon(intro.priority)}
            <Title level={5} className="m-0">
              {intro.connectionName}
            </Title>
            <Tag color={intro.pathType === 'direct' ? 'green' : 'blue'}>
              {intro.pathType === 'direct' ? 'Direct Contact' : 'Pathway'}
            </Tag>
          </div>
          
          <Text className="text-gray-600">
            {intro.connectionTitle} at {intro.connectionCompany}
          </Text>
          
          <div className="mt-2">
            <Text strong>Target: </Text>
            <Text>{intro.accountName}</Text>
          </div>

          <Paragraph className="mt-2 mb-1 text-sm text-gray-700">
            {intro.introductionMessage}
          </Paragraph>

          <div className="flex flex-wrap gap-2 mt-2">
            <Tag color="blue">
              <UserOutlined /> {intro.relationshipStrength} relationship
            </Tag>
            <Tag color="green">
              <LinkOutlined /> {formatConfidenceScore(intro.confidenceScore)} confidence
            </Tag>
            <Tag color="orange">
              <ClockCircleOutlined /> {intro.timeline}
            </Tag>
          </div>
        </div>

        <div className="ml-4 text-right">
          <div className="mb-2">
            <Text type="secondary" className="text-xs">Success Rate</Text>
            <div className="text-lg font-semibold text-green-600">
              {intro.expectedSuccessRate}%
            </div>
          </div>
          
          <Button 
            type="primary" 
            size="small"
            icon={<MessageOutlined />}
            className="mb-1"
          >
            Send Message
          </Button>
        </div>
      </div>

      <Divider className="my-2" />
      
      <div className="flex justify-between items-center">
        <Text className="text-xs text-gray-500">
          <strong>Strategy:</strong> {intro.recommendedAction}
        </Text>
        <Badge 
          count={`${intro.priority.toUpperCase()}`} 
          style={{backgroundColor: getPriorityColor(intro.priority)}}
        />
      </div>
    </Card>
  );

  if (loading) {
    return (
      <Card>
        <div className="text-center py-8">
          <Spin size="large" />
          <div className="mt-4">Loading relationship intelligence...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert
        message="Connection Error"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={fetchWarmIntroData}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div className="warm-intro-intelligence">
      {/* Stats Header */}
      {stats && (
        <Card className="mb-4">
          <Title level={4} className="mb-4">
            🎯 Relationship Intelligence Overview
          </Title>
          <Row gutter={16}>
            <Col span={4}>
              <Statistic 
                title="LinkedIn Connections" 
                value={stats.totalConnections} 
                valueStyle={{color: '#1890ff'}}
              />
            </Col>
            <Col span={4}>
              <Statistic 
                title="Target Accounts" 
                value={stats.totalAccounts}
                valueStyle={{color: '#722ed1'}}
              />
            </Col>
            <Col span={4}>
              <Statistic 
                title="Warm Pathways" 
                value={stats.warmPathways}
                valueStyle={{color: '#52c41a'}}
              />
            </Col>
            <Col span={4}>
              <Statistic 
                title="Direct Contacts" 
                value={stats.directCompanyMatches}
                valueStyle={{color: '#fa8c16'}}
              />
            </Col>
            <Col span={4}>
              <Statistic 
                title="Strong Relationships" 
                value={stats.strongRelationships}
                valueStyle={{color: '#eb2f96'}}
              />
            </Col>
            <Col span={4}>
              <Statistic 
                title="Avg Confidence" 
                value={formatConfidenceScore(stats.averageConfidence)}
                valueStyle={{color: '#13c2c2'}}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* Priority Alert */}
      {warmIntros.filter(intro => intro.priority === 'urgent').length > 0 && (
        <Alert
          message={`🚨 ${warmIntros.filter(intro => intro.priority === 'urgent').length} Urgent Warm Introductions Available`}
          description="High-confidence pathways with strong relationships ready for immediate outreach"
          type="warning"
          showIcon
          className="mb-4"
        />
      )}

      {/* Warm Introduction Cards */}
      <Card>
        <Title level={4} className="mb-4">
          🤝 Top Warm Introduction Opportunities
        </Title>
        
        {warmIntros.length === 0 ? (
          <div className="text-center py-8">
            <UserOutlined className="text-4xl text-gray-400 mb-4" />
            <Title level={5} className="text-gray-500">No Warm Introductions Found</Title>
            <Text className="text-gray-400">
              Connect your LinkedIn to discover relationship pathways to your target accounts
            </Text>
          </div>
        ) : (
          <div>
            {warmIntros.map(renderWarmIntroCard)}
            
            {warmIntros.length >= 10 && (
              <div className="text-center mt-4">
                <Button type="link">
                  View All {stats?.warmPathways || 'Available'} Warm Pathways →
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default WarmIntroIntelligence;